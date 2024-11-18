export default interface ComposerVulnerabilitiesReport {
  advisories: Advisories;
}

export interface Advisories {
  'guzzlehttp/guzzle': Advisor[];
}

export interface Advisor {
  title: string;
  cve: string;
  link: string;
  reportedAt: string;
  sources: Source[];
  severity: VulnerabilitySeverity;
  advisoryId: string;
  packageName: string;
  affectedVersions: string;
}

export interface Source {
  name: string;
  remoteId: string;
}

export type VulnerabilitySeverity = 'medium' | 'high' | 'critical';
