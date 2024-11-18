import fs from 'fs';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { relative, Via } from './common';
import path from 'path';

export default function exportSarif(filename: string, outputFilename: string, rootDir: string, debug: boolean = false) {
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
      const sep = '\n\t ';
      let msg = `Vulnerability: ${via.severity} ${via.name} ${sep} ${via.title} ${sep} advisor ${via.url}`;

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

      const ruleId = 'npm-dep-audit-' + key.toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');

      const sarifResultBuilder = new SarifResultBuilder();
      const sarifResultInit = {
        ruleId: ruleId,
        level: level,
        messageText: msg,
        fileUri: relative(rootDir, 'package.json'),

        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 1,
      };

      sarifResultBuilder.initSimple(sarifResultInit);
      sarifRunBuilder.addResult(sarifResultBuilder);
      if (debug) console.log(`${JSON.stringify(sarifResultInit)}\n================================`);
    }
  }

  sarifBuilder.addRun(sarifRunBuilder);

  const json = sarifBuilder.buildSarifJsonString({ indent: true });

  if (outputFilename) {
    const parentDirectory = path.dirname(outputFilename);
    if (!fs.existsSync(parentDirectory)) fs.mkdirSync(parentDirectory, { recursive: true });
    fs.writeFileSync(outputFilename, json);
    if (debug) console.log(json);
  } else {
    console.log(json);
  }
}
