export default interface NugetVulnerabilitiesReport {
  version: number;
  parameters: string;
  sources: string[];
  projects: Project[];
}

export interface Project {
  path: string;
  frameworks?: Framework[];
}

export interface Framework {
  framework: string;
  transitivePackages?: Package[];
  topLevelPackages?: Package[];
}

export interface Package {
  id: string;
  resolvedVersion: string;
  vulnerabilities: Vulnerability[];
  deprecationReasons?: string[];
  alternativePackage?: AlternativePackage;
}

export interface Vulnerability {
  severity: VulnerabilitySeverity;
  advisoryurl: string;
}

export interface AlternativePackage {
  id: string;
  versionRange: string;
}

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Moderate';
