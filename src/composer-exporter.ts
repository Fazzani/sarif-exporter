import fs from 'fs';
import path from 'path';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { Advisor, VulnerabilitySeverity } from './composer.models';
import { relative } from 'path';

const severityMap = (sev: VulnerabilitySeverity): Result.level => {
  let level: Result.level = 'error';
  if (sev == 'medium') {
    level = 'note';
  }
  if (sev == 'high') {
    level = 'warning';
  }
  if (sev == 'critical') {
    level = 'error';
  }
  return level;
};

export default function exportSarif(filename: string, outputFilename: string, rootDir: string, debug: boolean = false) {
  const results: any = JSON.parse(fs.readFileSync(filename, 'utf8'));

  // SARIF builder
  const sarifBuilder = new SarifBuilder();

  // SARIF Run builder
  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'composer-audit-sarif',
    toolDriverVersion: '0.0.1',
  });

  for (const [key, value] of Object.entries(results.advisories)) {
    const advisor: string = key;
    const packages = value as Advisor[];
    packages.forEach((pckg) => {
      if (pckg?.packageName) {
        const ruleId = 'composer-dep-audit-' + pckg.packageName.toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');
        const msg = `Vulnerability: ${advisor} ${pckg.title} \n\t ${pckg.cve} \n\t affectedVersions : ${pckg.affectedVersions} advisor ${pckg.link}`;
        const sarifResultBuilder = new SarifResultBuilder();
        const sarifResultInit = {
          ruleId: ruleId,
          level: severityMap(pckg.severity),
          messageText: msg,
          fileUri: relative(rootDir, 'composer.json'),

          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 1,
        };

        sarifResultBuilder.initSimple(sarifResultInit);
        sarifRunBuilder.addResult(sarifResultBuilder);
        if (debug) {
          console.log(`${JSON.stringify(sarifResultInit)}\n================================`);
        }
      }
    });
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
