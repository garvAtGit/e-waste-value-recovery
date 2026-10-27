export interface DeviceHardwareProfile {
  os: "iOS" | "Android" | "macOS" | "Windows" | "Linux" | "Unknown";
  deviceFamily: string; // e.g., "iPhone", "Samsung / Android Device", "MacBook / Mac", "Windows PC"
  browserName: string;
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  maxTouchPoints: number;
  cpuCores: number;
  estimatedRamGb: number | null;
  gpuRenderer: string;
  online: boolean;
  connectionType: string | null;
  batterySupported: boolean;
  batteryLevelPercent: number | null;
  isCharging: boolean | null;
  detectedAt: string;
}

export type DiagnosticStepId =
  | "device_telemetry"
  | "cpu_gpu_stress"
  | "touch_digitizer"
  | "screen_pixels"
  | "audio_loopback"
  | "camera_viewfinder"
  | "vibration_sensor"
  | "summary_certificate";

export type TestVerdict = "pending" | "running" | "passed" | "failed" | "skipped";

export interface SubsystemTestResult {
  id: DiagnosticStepId;
  label: string;
  verdict: TestVerdict;
  metrics: string;
  timestamp?: string;
  faultIdentified?: string;
}

export interface HardwareDocketReport {
  docketId: string;
  profile: DeviceHardwareProfile;
  results: Record<DiagnosticStepId, SubsystemTestResult>;
  overallHealthScore: number; // 0 to 100
  overallVerdict: "FLAWLESS" | "GOOD" | "MINOR_FAULTS" | "MAJOR_FAULTS";
  recommendedCondition: "flawless" | "good" | "fair" | "faulty";
  mappedFaultIds: string[];
  issuedAt: string;
  integrityHash: string;
}
