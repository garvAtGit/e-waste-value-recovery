import { DeviceHardwareProfile } from "./types";

export async function detectHardwareProfile(): Promise<DeviceHardwareProfile> {
  const isClient = typeof window !== "undefined";
  if (!isClient) {
    return {
      os: "Unknown",
      deviceFamily: "Server Environment",
      browserName: "Node.js",
      userAgent: "",
      screenResolution: "0 x 0",
      colorDepth: 24,
      pixelRatio: 1,
      maxTouchPoints: 0,
      cpuCores: 4,
      estimatedRamGb: null,
      gpuRenderer: "Generic Server Renderer",
      online: true,
      connectionType: null,
      batterySupported: false,
      batteryLevelPercent: null,
      isCharging: null,
      detectedAt: new Date().toISOString(),
    };
  }

  const ua = window.navigator.userAgent;
  let os: DeviceHardwareProfile["os"] = "Unknown";
  let deviceFamily = "Generic Device";

  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
    deviceFamily = /iPad/i.test(ua) ? "Apple iPad" : "Apple iPhone";
  } else if (/Android/i.test(ua)) {
    os = "Android";
    if (/Samsung/i.test(ua)) deviceFamily = "Samsung Galaxy";
    else if (/Pixel/i.test(ua)) deviceFamily = "Google Pixel";
    else if (/OnePlus/i.test(ua)) deviceFamily = "OnePlus";
    else if (/Xiaomi|Redmi|Poco/i.test(ua)) deviceFamily = "Xiaomi / Redmi";
    else if (/Nothing/i.test(ua)) deviceFamily = "Nothing Phone";
    else if (/Vivo/i.test(ua)) deviceFamily = "Vivo / iQOO";
    else deviceFamily = "Android Smartphone";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = "macOS";
    deviceFamily = "Apple Mac / MacBook";
  } else if (/Windows NT/i.test(ua)) {
    os = "Windows";
    deviceFamily = "Windows PC / Laptop";
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
    deviceFamily = "Linux Station";
  }

  // Browser name detection
  let browserName = "Modern Web Browser";
  if (/Edg/i.test(ua)) browserName = "Microsoft Edge";
  else if (/Chrome/i.test(ua) && !/Chromium|Edg/i.test(ua)) browserName = "Google Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = "Apple Safari";
  else if (/Firefox/i.test(ua)) browserName = "Mozilla Firefox";
  else if (/SamsungBrowser/i.test(ua)) browserName = "Samsung Internet";

  // WebGL GPU unmasked renderer detection
  let gpuRenderer = "Integrated / Software Accelerator";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        gpuRenderer =
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ||
          gl.getParameter(gl.RENDERER) ||
          gpuRenderer;
      } else {
        gpuRenderer = gl.getParameter(gl.RENDERER) || gpuRenderer;
      }
    }
  } catch {
    gpuRenderer = "Hardware Canvas Accelerated";
  }

  // RAM estimate (Chromium only)
  const nav = window.navigator as unknown as {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };

  const estimatedRamGb = nav.deviceMemory ? Number(nav.deviceMemory) : null;
  const connectionType = nav.connection?.effectiveType || null;

  // Battery status if supported
  let batteryLevelPercent: number | null = null;
  let isCharging: boolean | null = null;
  let batterySupported = false;

  if (typeof nav.getBattery === "function") {
    try {
      const b = await nav.getBattery();
      batterySupported = true;
      batteryLevelPercent = Math.round(b.level * 100);
      isCharging = b.charging;
    } catch {
      batterySupported = false;
    }
  }

  return {
    os,
    deviceFamily,
    browserName,
    userAgent: ua,
    screenResolution: `${window.screen.width * (window.devicePixelRatio || 1)} × ${
      window.screen.height * (window.devicePixelRatio || 1)
    }`,
    colorDepth: window.screen.colorDepth || 24,
    pixelRatio: window.devicePixelRatio || 1,
    maxTouchPoints: window.navigator.maxTouchPoints || 0,
    cpuCores: window.navigator.hardwareConcurrency || 4,
    estimatedRamGb,
    gpuRenderer,
    online: window.navigator.onLine ?? true,
    connectionType,
    batterySupported,
    batteryLevelPercent,
    isCharging,
    detectedAt: new Date().toISOString(),
  };
}
