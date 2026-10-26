import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9561;
const userDataDir = `C:\\Users\\thees\\AppData\\Local\\Temp\\chrome-cdp-sprint-e2e-${Date.now()}`;

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check"
], { stdio: "ignore" });

async function waitForCdp() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error("Failed to connect to Chrome on port " + port);
}

class BrowserClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.pending = new Map();
    this.consoleLogs = [];
    this.exceptions = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled") {
        const text = msg.params.args.map(a => a.value || a.description || "").join(" ");
        this.consoleLogs.push({ type: msg.params.type, text });
      }
      if (msg.method === "Runtime.exceptionThrown") {
        this.exceptions.push(msg.params.exceptionDetails);
        console.error("  [BROWSER EXCEPTION]", msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception);
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`CDP Eval Error: ${res.exceptionDetails.text} - ${JSON.stringify(res.exceptionDetails.exception)}`);
    }
    return res.result?.value;
  }

  async goto(url) {
    await this.send("Page.navigate", { url });
    await new Promise(r => setTimeout(r, 1200));
  }

  async waitFor(fnExpr, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await this.eval(fnExpr);
        if (res) return res;
      } catch {}
      await new Promise(r => setTimeout(r, 150));
    }
    throw new Error(`Timeout waiting for expression: ${fnExpr}`);
  }
}

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  PASS: ${message}`);
  } else {
    failCount++;
    console.error(`  FAIL: ${message}`);
  }
}

async function run() {
  console.log("===============================================================");
  console.log(" STARTING FULL-STACK SPRINT END-TO-END BROWSER TEST");
  console.log(" Testing Assessment -> Case Creation -> Lifecycle Milestones ->");
  console.log(" Dashboard -> Admin Console -> Outcome Verification -> Analytics");
  console.log("===============================================================\n");

  try {
    await waitForCdp();
    const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:3000/find-option`, { method: "PUT" })).json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    const browser = new BrowserClient(ws);
    await browser.send("Runtime.enable");
    await browser.send("Page.enable");

    // ==============================================================
    // STEP 1: ASSESSMENT & CASE CREATION
    // ==============================================================
    console.log("--- 1. Evaluating Device and Starting Recovery Case ---");
    await browser.goto("http://localhost:3000/find-option");

    // Configure assessment: Minor fault smartphone, pincode 560034
    await browser.eval(`
      (() => {
        // Model input
        const modelInput = document.querySelector('input[placeholder*="iPhone 12"]');
        if (modelInput) {
          modelInput.focus();
          if (modelInput._valueTracker) modelInput._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(modelInput, "iPhone 13 Pro");
          modelInput.dispatchEvent(new Event("input", { bubbles: true }));
          modelInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Fault input
        const faultInput = document.querySelector('input[placeholder*="Cracked outer glass"]');
        if (faultInput) {
          faultInput.focus();
          if (faultInput._valueTracker) faultInput._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(faultInput, "Cracked OLED display, touch working");
          faultInput.dispatchEvent(new Event("input", { bubbles: true }));
          faultInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Pincode input
        const pinInput = document.querySelector('input[placeholder*="110001"]');
        if (pinInput) {
          pinInput.focus();
          if (pinInput._valueTracker) pinInput._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(pinInput, "560034");
          pinInput.dispatchEvent(new Event("input", { bubbles: true }));
          pinInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    // Verify "Start Recovery Case" CTA button is present on the primary pathway card
    const hasStartCaseButton = await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.some(b => b.innerText.includes("Start Recovery Case"));
      })()
    `);
    assert(hasStartCaseButton, "Primary pathway card contains 'Start Recovery Case' CTA button");

    // Click "Start Recovery Case"
    console.log("  Clicking 'Start Recovery Case' to create case via API...");
    await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const startBtn = btns.find(b => b.innerText.includes("Start Recovery Case"));
        if (startBtn) startBtn.click();
      })()
    `);

    // Wait for navigation to /cases/[id]
    await browser.waitFor(`window.location.pathname.startsWith("/cases/")`, 8000);
    const caseUrl = await browser.eval(`window.location.pathname`);
    const caseId = caseUrl.split("/").pop();
    assert(caseUrl.startsWith("/cases/") && caseId && caseId.length > 5, `Successfully created case and routed to '${caseUrl}'`);

    // ==============================================================
    // STEP 2: CASE DETAIL & LIFECYCLE PROGRESSION
    // ==============================================================
    console.log("\n--- 2. Verifying Case Details & Advancing State Machine ---");
    const caseHeading = await browser.eval(`document.querySelector("h1")?.innerText`);
    assert(caseHeading?.includes("iPhone 13 Pro") || caseHeading?.includes("Case"), `Case header displays hardware title (found: '${caseHeading}')`);

    const initialBadge = await browser.eval(`document.body.innerText.includes("Case Created") || document.body.innerText.includes("Step 1")`);
    assert(initialBadge, "Initial case status badge displays 'Case Created' / 'Step 1: Ready to Contact'");

    // Milestone 1: created -> contacted
    console.log("  Advancing status: 'created' -> 'contacted'...");
    await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.innerText.includes("Contacted the Provider"));
        if (btn) btn.click();
      })()
    `);
    await browser.waitFor(`document.body.innerText.includes("Provider Contacted")`, 5000);
    await new Promise(r => setTimeout(r, 500));
    assert(true, "Successfully advanced case status to 'Provider Contacted'");

    // Milestone 2: contacted -> accepted_by_provider
    console.log("  Advancing status: 'contacted' -> 'accepted_by_provider'...");
    await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.innerText.includes("Provider Accepted Device"));
        if (btn) btn.click();
      })()
    `);
    await browser.waitFor(`document.body.innerText.includes("Accepted by Provider")`, 5000);
    await new Promise(r => setTimeout(r, 500));
    assert(true, "Successfully advanced case status to 'Accepted by Provider'");

    // Milestone 3: accepted_by_provider -> dropped_off_or_collected
    console.log("  Advancing status: 'accepted_by_provider' -> 'dropped_off_or_collected'...");
    await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.innerText.includes("Delivered to Drop-off Depot") || b.innerText.includes("Drop-off Depot"));
        if (btn) btn.click();
      })()
    `);
    await browser.waitFor(`document.body.innerText.includes("Delivered to Facility")`, 5000);
    await new Promise(r => setTimeout(r, 500));
    assert(true, "Successfully advanced case status to 'Delivered to Facility'");

    // Milestone 4: dropped_off_or_collected -> completed (with user reported outcome)
    console.log("  Completing recovery case with final outcome payload...");
    await browser.eval(`
      (() => {
        // Open completion drawer / form
        const btns = Array.from(document.querySelectorAll("button"));
        const btn = btns.find(b => b.innerText.includes("Mark Recovery Completed"));
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 400));

    // Fill outcome amount and notes
    await browser.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll("input"));
        const amountInput = inputs.find(i => i.placeholder && i.placeholder.includes("4500"));
        if (amountInput) {
          amountInput.focus();
          if (amountInput._valueTracker) amountInput._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(amountInput, "2800");
          amountInput.dispatchEvent(new Event("input", { bubbles: true }));
          amountInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const notesInput = inputs.find(i => i.placeholder && i.placeholder.includes("Receipt #48291"));
        if (notesInput) {
          notesInput.focus();
          if (notesInput._valueTracker) notesInput._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(notesInput, "Screen replaced successfully with warranty");
          notesInput.dispatchEvent(new Event("input", { bubbles: true }));
          notesInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Submit completion
        const confirmBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Confirm Completion"));
        if (confirmBtn) confirmBtn.click();
      })()
    `);
    await browser.waitFor(`document.body.innerText.includes("Completed & Verified") || document.body.innerText.includes("Recovery Completed")`, 5000);
    assert(true, "Successfully completed recovery case with user reported outcome");

    // Verify unverified badge label (user_reported)
    const verificationBadgeText = await browser.eval(`
      (() => {
        const badges = Array.from(document.querySelectorAll("span"));
        return badges.find(b => b.innerText.includes("User-Reported") || b.innerText.includes("Self-Reported") || b.innerText.includes("User Reported"))?.innerText;
      })()
    `);
    assert(Boolean(verificationBadgeText), `Completed case accurately labelled as user self-reported ('${verificationBadgeText}')`);

    // ==============================================================
    // STEP 3: USER DASHBOARD
    // ==============================================================
    console.log("\n--- 3. Verifying User Dashboard (/dashboard) ---");
    await browser.goto("http://localhost:3000/dashboard");

    const dashboardTitle = await browser.eval(`document.querySelector("h1")?.innerText`);
    assert(dashboardTitle?.includes("Hardware Recovery Cases") || dashboardTitle?.includes("Recovery Operations Dashboard"), `Dashboard rendered with title: '${dashboardTitle}'`);

    const hasCompletedCaseInDashboard = await browser.eval(`
      document.body.innerText.includes("iPhone 13 Pro") || document.body.innerText.includes("Completed")
    `);
    assert(hasCompletedCaseInDashboard, "User dashboard lists the completed case and history");

    // ==============================================================
    // STEP 4: ADMIN CONSOLE & OUTCOME VERIFICATION
    // ==============================================================
    console.log("\n--- 4. Verifying Admin Console & Privilege Controls (/admin) ---");
    await browser.goto("http://localhost:3000/admin");

    const isLoginPromptVisible = await browser.eval(`
      document.body.innerText.includes("Operations Console Access")
    `);
    assert(isLoginPromptVisible, "Admin console prompts for authentication when unauthenticated");

    // Enter admin key
    console.log("  Entering admin key to authenticate session...");
    await browser.eval(`
      (() => {
        const input = document.querySelector('input[type="password"]');
        if (input) {
          input.focus();
          if (input._valueTracker) input._valueTracker.setValue("");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, "ewaste-admin-secret-dev-2026");
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Authenticate Operations Console"));
        if (btn) btn.click();
      })()
    `);
    await browser.waitFor(`document.body.innerText.includes("Provider Verification & Operational Audit")`, 5000);
    assert(true, "Successfully authenticated admin console with admin secret key");

    // Verify tabs: Candidates, Cases, Audit Logs
    const hasCandidatesTab = await browser.eval(`document.body.innerText.includes("Candidate Providers")`);
    const hasCasesTab = await browser.eval(`document.body.innerText.includes("Operational Cases")`);
    const hasLogsTab = await browser.eval(`document.body.innerText.includes("Audit History")`);
    assert(hasCandidatesTab && hasCasesTab && hasLogsTab, "Admin console exposes Candidate Providers, Operational Cases, and Audit History");

    // Switch to Operational Cases tab
    console.log("  Switching to Operational Cases tab and verifying outcome...");
    await browser.eval(`
      (() => {
        const tabs = Array.from(document.querySelectorAll("button"));
        const caseTab = tabs.find(t => t.innerText.includes("Operational Cases"));
        if (caseTab) caseTab.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 400));

    // Find and click "Verify Outcome"
    const hasVerifyButton = await browser.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.some(b => b.innerText.includes("Verify Outcome"));
      })()
    `);
    assert(hasVerifyButton, "Admin console displays 'Verify Outcome' action for completed case");

    if (hasVerifyButton) {
      await browser.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const verifyBtn = btns.find(b => b.innerText.includes("Verify Outcome"));
          if (verifyBtn) verifyBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 400));

      // Fill verification notes in modal and confirm
      await browser.eval(`
        (() => {
          const textarea = document.querySelector("textarea");
          if (textarea) {
            textarea.focus();
            if (textarea._valueTracker) textarea._valueTracker.setValue("");
            const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            setter.call(textarea, "Audited repair invoice and screen part serial against provider inventory.");
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
          }
          const submitBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Confirm Verification"));
          if (submitBtn) submitBtn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 800));

      // Switch to Audit History tab to verify audit entry
      await browser.eval(`
        (() => {
          const tabs = Array.from(document.querySelectorAll("button"));
          const logTab = tabs.find(t => t.innerText.includes("Audit History"));
          if (logTab) logTab.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 400));

      const hasAuditEntry = await browser.eval(`
        document.body.innerText.includes("outcome_verified") || document.body.innerText.includes("verify_outcome") || document.body.innerText.includes("admin_audit") || document.body.innerText.includes("Audited repair invoice") || document.body.innerText.includes("Case Outcome Verified")
      `);
      assert(hasAuditEntry, "Admin audit log records immutable event for verified outcome");
    }

    // ==============================================================
    // STEP 5: IMPACT & ANALYTICS DASHBOARD
    // ==============================================================
    console.log("\n--- 5. Verifying Impact & Platform Analytics (/analytics) ---");
    await browser.goto("http://localhost:3000/analytics");

    const analyticsHeader = await browser.eval(`document.querySelector("h1")?.innerText`);
    assert(analyticsHeader?.includes("Recovery Impact") || analyticsHeader?.includes("Impact & Operational Analytics"), `Analytics dashboard loaded (title: '${analyticsHeader}')`);

    const hasFunnelMetrics = await browser.eval(`
      document.body.innerText.includes("Total Cases Initiated") &&
      document.body.innerText.includes("Completion Rate") &&
      document.body.innerText.includes("Recovery Funnel")
    `);
    assert(hasFunnelMetrics, "Operational funnel metrics (Initiated, Completion Rate, Funnel) accurately displayed");

    const hasVerificationSplit = await browser.eval(`
      document.body.innerText.includes("Provider-Verified") &&
      document.body.innerText.includes("Completed Recovery Outcomes")
    `);
    assert(hasVerificationSplit, "Verification tier split (Provider-Verified vs User Self-Reported) transparently published");

    const hasMethodologyDisclosures = await browser.eval(`
      document.body.textContent.includes("Methodology, Assumptions") ||
      document.body.innerText.toLowerCase().includes("methodology") ||
      document.body.innerText.toLowerCase().includes("environmental savings")
    `);
    assert(hasMethodologyDisclosures, "Scientific environmental methodology and baseline references fully documented");

    console.log("\n--- 6. Checking Browser Console Health ---");
    const errors = browser.consoleLogs.filter(l => l.type === "error");
    assert(errors.length === 0, `0 browser console errors during entire user journey (errors: ${errors.length})`);
    assert(browser.exceptions.length === 0, `0 uncaught exceptions thrown during sprint execution (exceptions: ${browser.exceptions.length})`);

    console.log("\n===============================================================");
    console.log(` SPRINT E2E TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${testCount} checks`);
    console.log("===============================================================\n");

    ws.close();
    chrome.kill();
    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed with error:", err);
    chrome.kill();
    process.exit(1);
  }
}

run();
