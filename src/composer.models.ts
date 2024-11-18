export default interface ComposerVulnerabilitiesReport {
  advisories: Advisories;
}

export interface Advisories {
  'guzzlehttp/guzzle': GuzzlehttpGuzzle[];
}

export interface GuzzlehttpGuzzle {
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
