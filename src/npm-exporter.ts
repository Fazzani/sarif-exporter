import fs from 'fs';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { Via } from './common';
import path from 'path';

export function relative(rootDir: string, fullPath: string) {
  if (rootDir) {
    if (fullPath.toLowerCase().startsWith(rootDir.toLowerCase())) {
      return fullPath.substring(rootDir.length);
    }
  }
  return fullPath;
}

export default function exportSarif(filename: string, outputFilename: string, rootDir: string) {
  const results = JSON.parse(fs.readFileSync(filename, 'utf8'));

  // SARIF builder
  const sarifBuilder = new SarifBuilder();

  // SARIF Run builder
  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'npm-audit-sarif',
    toolDriverVersion: '0.0.1',
  });

  for (const key in results.vulnerabilities) {
    const value = results.vulnerabilities[key];

    for (const viaobj of value.via) {
      if (typeof viaobj == 'string') {
        continue;
      }
      const via: Via = viaobj as Via;
      let msg = 'Audit: ' + via.severity + '\n' + via.name + '\n' + via.title + '\n' + via.url;

      if (via.cwe.length) {
        for (const cwe of via.cwe) {
          msg += '\n';
          msg += cwe;
        }
      }

      let level: Result.level = 'error';
      if (via.severity == 'moderate') {
        level = 'note';
      }
      if (via.severity == 'high') {
        level = 'warning';
      }
      if (via.severity == 'critical') {
        level = 'error';
      }

      const ruleId = 'npm-audit-' + key.toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');

      const sarifResultBuilder = new SarifResultBuilder();
      const sarifResultInit = {
        ruleId: ruleId,
        level: level,
        messageText: msg,
        fileUri: relative(rootDir, 'package.json'),

        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0,
      };

      sarifResultInit.startLine = 1;
      sarifResultInit.startColumn = 1;
      sarifResultInit.endLine = 1;
      sarifResultInit.endColumn = 1;

      sarifResultBuilder.initSimple(sarifResultInit);
      sarifRunBuilder.addResult(sarifResultBuilder);
    }
  }

  sarifBuilder.addRun(sarifRunBuilder);

  const json = sarifBuilder.buildSarifJsonString({ indent: true });

  if (outputFilename) {
    const parentDirectory = path.dirname(outputFilename);
    if (!fs.existsSync(parentDirectory)) fs.mkdirSync(parentDirectory, { recursive: true });
    fs.writeFileSync(outputFilename, json);
  } else {
    console.log(json);
  }
}
