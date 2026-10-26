import { spawn } from "child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9559;
const userDataDir = `C:\\Users\\thees\\AppData\\Local\\Temp\\chrome-cdp-smoke-${Date.now()}`;

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
        if (msg.params.type === "error") {
          console.error("  [BROWSER CONSOLE ERROR]", text);
        }
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
    // Allow React hydration to settle
    await new Promise(r => setTimeout(r, 1200));
  }

  async waitFor(fnExpr, timeoutMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await this.eval(fnExpr);
        if (res) return res;
      } catch {}
      await new Promise(r => setTimeout(r, 100));
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

async function runSmokeTests() {
  console.log("===============================================================");
  console.log(" STARTING BROWSER SMOKE TEST (Chrome Headless CDP)");
  console.log(" Target: http://localhost:3000");
  console.log("===============================================================\n");

  await waitForCdp();
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:3000`, { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  const browser = new BrowserClient(ws);

  await browser.send("Page.enable");
  await browser.send("Runtime.enable");

  // -------------------------------------------------------------
  // TEST 1: Homepage (/) Navigation & CTAs
  // -------------------------------------------------------------
  console.log("--- 1. Testing Homepage (/) Navigation & CTAs ---");
  await browser.goto("http://localhost:3000/");

  const pageTitle = await browser.eval("document.title");
  assert(pageTitle.includes("E-Waste Value Recovery"), `Page title is '${pageTitle}'`);

  const logoHref = await browser.eval("document.querySelector('header a')?.getAttribute('href')");
  assert(logoHref === "/", `Header logo links to '/' (found: ${logoHref})`);

  const navLinks = await browser.eval(`
    Array.from(document.querySelectorAll("header nav a")).map(a => ({ text: a.innerText.trim(), href: a.getAttribute("href") }))
  `);
  console.log(`  Found ${navLinks.length} header navigation links:`, navLinks.map(l => l.text).join(", "));
  assert(navLinks.some(l => l.href === "/find-option"), "Header has link to /find-option");
  assert(navLinks.some(l => l.href === "/directory"), "Header has link to /directory");

  const headerCta = await browser.eval(`
    Array.from(document.querySelectorAll("header a")).find(a => a.innerText.includes("Find Best Option"))?.getAttribute("href")
  `);
  assert(headerCta === "/find-option", `Header CTA button links to '/find-option' (found: ${headerCta})`);

  const heroCtas = await browser.eval(`
    Array.from(document.querySelectorAll("section a")).map(a => ({ text: a.innerText.trim(), href: a.getAttribute("href") }))
  `);
  const evalDeviceCta = heroCtas.find(c => c.text.includes("Find the Best Option"));
  assert(evalDeviceCta && evalDeviceCta.href === "/find-option", `Hero 'Find the Best Option' CTA links to '/find-option'`);

  const pathwayExplorerCta = heroCtas.find(c => c.text.includes("Compare with Providers"));
  assert(pathwayExplorerCta && pathwayExplorerCta.href === "/find-option", `PathwayExplorer bridge CTA links to '/find-option'`);

  // Test clicking header CTA to navigate to /find-option
  console.log("  Navigating to /find-option via Header CTA...");
  await browser.eval(`
    Array.from(document.querySelectorAll("header a")).find(a => a.innerText.includes("Find Best Option"))?.click();
  `);
  await new Promise(r => setTimeout(r, 1000));
  const currentUrl = await browser.eval("window.location.pathname");
  assert(currentUrl === "/find-option", `Navigated successfully to '/find-option' (current: ${currentUrl})`);
  await browser.waitFor(`document.querySelectorAll('input[type="radio"]').length >= 4`, 8000);

  // -------------------------------------------------------------
  // TEST 2: Device Assessments (/find-option)
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Device Assessments on /find-option ---");

  // Helper to fill assessment form
  async function fillAssessment({ categorySlug, model, condition, specificFault, pincode, priorityText }) {
    await browser.eval(`
      (() => {
        // Reset form first
        const resetBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset"));
        if (resetBtn) resetBtn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 200));

    // 1. Category
    if (categorySlug) {
      await browser.eval(`
        (() => {
          const catButtons = Array.from(document.querySelectorAll('div[role="group"][aria-label="Category selector"] button'));
          const btn = catButtons.find(b => b.innerText.toLowerCase().includes("${categorySlug.split("-")[0]}"));
          if (btn) btn.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 100));
    }

    // 2. Model
    if (model) {
      await browser.eval(`
        (() => {
          const input = document.querySelector('input[placeholder*="iPhone 12"]');
          if (input) {
            input.focus();
            if (input._valueTracker) input._valueTracker.setValue("");
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, "${model}");
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        })()
      `);
    }

    // 3. Condition radio
    if (condition) {
      await browser.eval(`
        (() => {
          const radio = document.querySelector('input[type="radio"][value="${condition}"]');
          if (radio) {
            const label = radio.closest("label");
            if (label) label.click();
            radio.checked = true;
            radio.dispatchEvent(new Event("input", { bubbles: true }));
            radio.dispatchEvent(new Event("change", { bubbles: true }));
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
    }

    // 4. Fault
    if (specificFault) {
      await browser.eval(`
        (() => {
          const input = document.querySelector('input[placeholder*="Cracked outer glass"]');
          if (input) {
            input.focus();
            if (input._valueTracker) input._valueTracker.setValue("");
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, "${specificFault}");
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        })()
      `);
    }

    // 5. Pincode
    if (pincode !== undefined) {
      await browser.eval(`
        (() => {
          const input = document.querySelector('input[placeholder*="110001"]');
          if (input) {
            input.focus();
            if (input._valueTracker) input._valueTracker.setValue("");
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, "${pincode}");
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        })()
      `);
    }

    // 6. Priority
    if (priorityText) {
      await browser.eval(`
        (() => {
          const prioBtns = Array.from(document.querySelectorAll('div[role="group"][aria-label="Priority selection"] button'));
          const btn = prioBtns.find(b => b.innerText.includes("${priorityText}"));
          if (btn) btn.click();
        })()
      `);
    }

    // Allow evaluation state to update
    await new Promise(r => setTimeout(r, 500));
  }

  // 2.1 Normal working recent device assessment
  console.log("\n  [Assessment 2.1] Normal Working Recent Device (Google Pixel 7 Pro, 110001, Maximise Money)");
  await fillAssessment({
    categorySlug: "smartphones",
    model: "Google Pixel 7 Pro",
    condition: "working_recent",
    pincode: "110001",
    priorityText: "Maximise Money"
  });

  const a1PrimaryTitle = await browser.eval(`
    document.querySelector("div.border-emerald-600 h3")?.innerText
  `);
  assert(a1PrimaryTitle?.includes("Sell for Cash") || a1PrimaryTitle?.includes("Direct to Consumer") || a1PrimaryTitle?.includes("Resale"), `Primary recommendation is Sell for Cash or Resale (found: '${a1PrimaryTitle}')`);

  const a1Explanation = await browser.eval(`
    document.querySelector("div.border-emerald-600 div.bg-slate-50")?.innerText
  `);
  assert(a1Explanation?.includes("Google Pixel 7 Pro"), `Explanation mentions 'Google Pixel 7 Pro' (found: '${a1Explanation?.slice(0, 100)}')`);

  const a1HazardBanner = await browser.eval(`
    Array.from(document.querySelectorAll("h3")).some(h => h.innerText.includes("Damaged / Swollen") || h.innerText.includes("HAZARD"))
  `);
  assert(!a1HazardBanner, "Hazard alert banner is NOT displayed for normal working device");

  const a1PincodeNotice = await browser.eval(`
    Array.from(document.querySelectorAll("span, div")).some(el => el.innerText.includes("Notice on Pincode Coverage:") && el.innerText.includes("110001"))
  `);
  assert(a1PincodeNotice, `Honest pincode notice displayed for 110001`);

  // 2.2 Older working device assessment
  console.log("\n  [Assessment 2.2] Older Working Device (Lenovo ThinkPad T480, 560001, Dispose Responsibly)");
  await fillAssessment({
    categorySlug: "laptops",
    model: "Lenovo ThinkPad T480",
    condition: "working_older",
    pincode: "560001",
    priorityText: "Dispose Responsibly"
  });

  const a2PrimaryTitle = await browser.eval(`
    document.querySelector("div.border-emerald-600 h3")?.innerText
  `);
  assert(a2PrimaryTitle?.includes("Donate") || a2PrimaryTitle?.includes("Reuse"), `Primary recommendation is Donation & Reuse (found: '${a2PrimaryTitle}')`);

  const a2ProviderMatch = await browser.eval(`
    Array.from(document.querySelectorAll("div.border-emerald-600 ~ *")).some(el => el.innerText.includes("Digital Inclusion Alliance"))
  `);
  assert(a2ProviderMatch, "Digital Inclusion Alliance matched for working older laptop in 560001");

  // 2.3 Major fault device assessment
  console.log("\n  [Assessment 2.3] Major Fault Device (Apple iPhone 11, Water Damage Won't Boot, 560001, Maximise Money)");
  await fillAssessment({
    categorySlug: "smartphones",
    model: "Apple iPhone 11",
    condition: "major_fault",
    specificFault: "Water damage, motherboard short circuit, won't boot",
    pincode: "560001",
    priorityText: "Maximise Money"
  });

  const a3PrimaryTitle = await browser.eval(`
    document.querySelector("div.border-emerald-600 h3")?.innerText
  `);
  assert(a3PrimaryTitle?.includes("Refurbishers") || a3PrimaryTitle?.includes("Salvage"), `Primary recommendation is Refurbishers & Salvage (found: '${a3PrimaryTitle}')`);

  // Check that commercial cash buyback is excluded
  const a3SellCashExcluded = await browser.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll("div.rounded-2xl"));
      const sellCard = cards.find(c => c.innerText.includes("Sell for Cash") && c.querySelector("h4, h3"));
      return sellCard ? sellCard.innerText.toLowerCase().includes("excluded") : false;
    })()
  `);
  assert(a3SellCashExcluded, "Direct Cash Buyback is marked Excluded for unbootable major fault device");

  // Check that Apex Certified Material Recovery is matched under recycling
  const a3ApexMatch = await browser.eval(`
    Array.from(document.querySelectorAll("body")).some(b => b.innerText.includes("Apex Certified Material Recovery"))
  `);
  assert(a3ApexMatch, "Apex Certified Material Recovery matched in recycling route for major fault");

  // 2.4 Hazardous device assessment
  console.log("\n  [Assessment 2.4] Hazardous Device (Samsung Galaxy Note 8, Swollen Battery, 110001)");
  await fillAssessment({
    categorySlug: "smartphones",
    model: "Samsung Galaxy Note 8",
    condition: "unsafe_hazardous",
    pincode: "110001",
    priorityText: "Dispose Responsibly"
  });

  const a4HazardHeadline = await browser.eval(`
    Array.from(document.querySelectorAll("h3")).find(h => h.innerText.includes("Lithium Battery Hazard"))?.innerText
  `);
  assert(Boolean(a4HazardHeadline), `Hazard alert banner rendered with: '${a4HazardHeadline}'`);

  const a4StopUseWarning = await browser.eval(`
    document.body.innerText.includes("STOP USE: Damaged / Swollen Lithium Battery Hazard") &&
    document.body.innerText.includes("IMMEDIATE SAFETY RISK • STOP USE")
  `);
  assert(a4StopUseWarning, "Stop use warning displayed prominently: 'IMMEDIATE SAFETY RISK • STOP USE'");

  const a4HandlingSteps = await browser.eval(`
    (() => {
      const bodyText = document.body.innerText.toLowerCase();
      return bodyText.includes("mandatory safe handling protocol") &&
        (bodyText.includes("fire-safe") || bodyText.includes("well-ventilated"));
    })()
  `);
  assert(a4HandlingSteps, "Safe handling instructions provided (ventilated, fire-safe container/location)");

  // Check that commercial pathways are excluded
  const a4SellCashExcluded = await browser.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll("div.rounded-2xl"));
      const sellCard = cards.find(c => c.innerText.includes("Sell for Cash") && c.querySelector("h4, h3"));
      return sellCard ? sellCard.innerText.toLowerCase().includes("excluded") : false;
    })()
  `);
  assert(a4SellCashExcluded, "Direct Cash Buyback excluded for hazardous device");

  const a4RepairExcluded = await browser.eval(`
    (() => {
      const cards = Array.from(document.querySelectorAll("div.rounded-2xl"));
      const repairCard = cards.find(c => c.innerText.includes("Repair and Continue Using") && c.querySelector("h4, h3"));
      return repairCard ? repairCard.innerText.toLowerCase().includes("excluded") : false;
    })()
  `);
  assert(a4RepairExcluded, "Repair and Continue Using excluded for hazardous device");

  // Check primary title under hazardous condition
  const a4PrimaryTitle = await browser.eval(`
    Array.from(document.querySelectorAll("div.rounded-2xl.border-2")).find(c => c.innerText.includes("RECOMMENDED PRIMARY OPTION"))?.innerText
  `);
  assert(a4PrimaryTitle?.includes("Authorised Hazardous Recovery (No verified local provider on record)"), "Primary option is Authorised Hazardous Recovery with honest missing provider declaration");

  // -------------------------------------------------------------
  // TEST 3: Directory (/directory)
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing Provider Directory on /directory ---");
  await browser.goto("http://localhost:3000/directory");

  // 3.1 Verify Candidate Quarantine (No unverified Delhi candidates in directory)
  console.log("  [Directory 3.1] Quarantine Verification");
  const dirBodyText = await browser.eval("document.body.innerText");
  const delhiCandidateNames = ["Cashify", "Croma", "Apple Saket", "Eco-Wise Waste Management", "EWRI", "Hulladek"];
  const leakedCandidates = delhiCandidateNames.filter(name => dirBodyText.includes(name));
  assert(leakedCandidates.length === 0, `No pending-review Delhi candidates leaked in directory (leaked: ${leakedCandidates.join(", ") || "none"})`);

  await browser.waitFor(`document.querySelectorAll("div.grid > div.rounded-2xl.border").length === 3`, 8000);
  const totalProvidersInitial = await browser.eval(`
    document.querySelectorAll("div.grid > div.rounded-2xl.border").length
  `);
  assert(totalProvidersInitial === 3, `Expected exactly 3 approved demo providers rendered (found: ${totalProvidersInitial})`);

  // 3.2 Exact-pincode filtering
  console.log("\n  [Directory 3.2] Exact Pincode Filtering");
  // Filter 560034 -> Precision Hardware Lab
  await browser.eval(`
    (() => {
      const input = document.querySelector('input[placeholder*="110001 or Delhi"]');
      if (input) {
        input.focus();
        if (input._valueTracker) input._valueTracker.setValue("");
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(input, "560034");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  const count560034 = await browser.eval(`
    document.querySelectorAll("div.grid > div.rounded-2xl.border").length
  `);
  const name560034 = await browser.eval(`
    document.querySelector("div.grid > div.rounded-2xl.border h3")?.innerText
  `);
  assert(count560034 === 1, `Pincode 560034 matches exactly 1 provider (found: ${count560034})`);
  assert(name560034?.includes("Precision Hardware Lab"), `Matched provider is 'Precision Hardware Lab' (found: '${name560034}')`);

  // Filter 560099 -> 0 providers (honest empty state)
  await browser.eval(`
    (() => {
      const input = document.querySelector('input[placeholder*="110001 or Delhi"]');
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(input, "560099");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  const emptyStateH3 = await browser.eval(`
    Array.from(document.querySelectorAll("h3")).find(h => h.innerText.includes("No matching providers found"))?.innerText
  `);
  assert(Boolean(emptyStateH3), `Honest empty state displayed for unmatched pincode 560099: '${emptyStateH3}'`);

  // Reset filters
  await browser.eval(`
    (() => {
      const resetBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset All Filters") || b.innerText.includes("Reset Filters"));
      if (resetBtn) resetBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // 3.3 Service & Category filtering
  console.log("\n  [Directory 3.3] Service & Category Filtering");
  await browser.eval(`
    (() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const catSelect = selects[0];
      const srvSelect = selects[1];
      if (catSelect) {
        catSelect.value = "smartphones-tablets";
        catSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (srvSelect) {
        srvSelect.value = "repair";
        srvSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  const countRepairSmartphones = await browser.eval(`
    document.querySelectorAll("div.grid > div.rounded-2xl.border").length
  `);
  const nameRepairSmartphones = await browser.eval(`
    document.querySelector("div.grid > div.rounded-2xl.border h3")?.innerText
  `);
  assert(countRepairSmartphones === 1, `Category: smartphones + Service: repair matches 1 provider (found: ${countRepairSmartphones})`);
  assert(nameRepairSmartphones?.includes("Precision Hardware Lab"), `Matched provider is 'Precision Hardware Lab'`);

  // Reset filters
  await browser.eval(`
    (() => {
      const resetBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset Filters") || b.innerText.includes("Reset All Filters"));
      if (resetBtn) resetBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // 3.4 Pickup vs Drop-off Logistics
  console.log("\n  [Directory 3.4] Logistics Filtering (Pickup vs Drop-off)");
  await browser.eval(`
    (() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const logSelect = selects[3]; // logistics is 4th select (index 3)
      if (logSelect) {
        logSelect.value = "pickup";
        logSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  const pickupCount = await browser.eval(`
    document.querySelectorAll("div.grid > div.rounded-2xl.border").length
  `);
  const pickupName = await browser.eval(`
    document.querySelector("div.grid > div.rounded-2xl.border h3")?.innerText
  `);
  assert(pickupCount === 1, `Logistics: pickup matches 1 provider (found: ${pickupCount})`);
  assert(pickupName?.includes("Apex Certified Material Recovery"), `Pickup provider is 'Apex Certified Material Recovery' (found: '${pickupName}')`);

  // Reset filters
  await browser.eval(`
    (() => {
      const resetBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Reset Filters") || b.innerText.includes("Reset All Filters"));
      if (resetBtn) resetBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  // 3.5 Office vs Public Depot Distinction
  console.log("\n  [Directory 3.5] Office vs Public Depot Distinction");
  const depotLabels = await browser.eval(`
    Array.from(document.querySelectorAll("strong")).map(s => s.innerText).filter(t => t.includes("Public Drop-off Depot") || t.includes("Consumer walk-in unconfirmed"))
  `);
  console.log("  Drop-off facility labels found:", depotLabels);
  assert(depotLabels.some(l => l.includes("Public Drop-off Depot")), "Found 'Public Drop-off Depot:' label on verified drop-off locations");

  // -------------------------------------------------------------
  // TEST 4: Integrity, Console Errors, and Links
  // -------------------------------------------------------------
  console.log("\n--- 4. Checking Runtime Errors, Link Integrity, and Console Logs ---");
  const brokenLinks = await browser.eval(`
    Array.from(document.querySelectorAll("a")).map(a => a.getAttribute("href")).filter(h => !h || h.includes("undefined") || h.includes("null") || h.startsWith("javascript:;"))
  `);
  assert(brokenLinks.length === 0, `0 broken href links found (broken: ${brokenLinks.join(", ") || "none"})`);
  assert(browser.exceptions.length === 0, `0 uncaught browser exceptions thrown (count: ${browser.exceptions.length})`);

  console.log("\n===============================================================");
  console.log(` SMOKE TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${testCount} checks`);
  console.log("===============================================================\n");

  ws.close();
}

try {
  await runSmokeTests();
} catch (err) {
  console.error("SMOKE TEST RUNNER ERROR:", err);
} finally {
  chrome.kill();
  process.exit(failCount > 0 ? 1 : 0);
}
