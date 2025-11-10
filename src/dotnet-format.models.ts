export interface DotnetFormatDiagnostic {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine?: number;
  endColumn?: number;
  ruleId: string;
  category: 'style' | 'whitespace' | 'analyzer';
  message: string;
  severity?: string;
}

export interface DotnetFormatReport {
  version: string;
  diagnostics: DotnetFormatDiagnostic[];
}
