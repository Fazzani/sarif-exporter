export interface Via {
  source: number;
  name: string;
  dependency: string;
  title: string;
  url: string;
  severity: string;
  cwe: string[];
}

export interface Vulnerability {
  name: string;
  severity: string;
  via: Via[] | string[];
  isDirect: boolean;
  range: string;
  fixAvailable: boolean;
}

export function minVal(val: number) {
  if (val) {
    return val;
  }
  return 1;
}

export function relative(rootDir: string, fullPath: string) {
  if (rootDir) {
    if (fullPath.toLowerCase().startsWith(rootDir.toLowerCase())) {
      return fullPath.substring(rootDir.length);
    }
  }
  return fullPath;
}
