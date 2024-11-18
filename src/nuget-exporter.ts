import fs from 'fs';
import path from 'path';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import NugetVulnerabilitiesReport, { VulnerabilitySeverity } from './nuget.models';
import { relative } from 'path';

const severityMap = (sev: VulnerabilitySeverity): Result.level => {
  let level: Result.level = 'error';
  if (sev == 'Moderate') {
    level = 'note';
  }
  if (sev == 'High') {
    level = 'warning';
  }
  if (sev == 'Critical') {
    level = 'error';
  }
  return level;
};

export default function exportSarif(filename: string, outputFilename: string, rootDir: string, debug: boolean = false) {
  const results: NugetVulnerabilitiesReport = JSON.parse(fs.readFileSync(filename, 'utf8'));

  // SARIF builder
  const sarifBuilder = new SarifBuilder();

  // SARIF Run builder
  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'nuget-audit-sarif',
    toolDriverVersion: '0.0.1',
  });
  results.projects
    .filter((x) => x.frameworks)
    .forEach((project) => {
      project!.frameworks.forEach((framework) => {
        const allPackages = [...(framework?.transitivePackages ?? []), ...(framework?.topLevelPackages ?? [])];
        allPackages
          .filter((x) => x.vulnerabilities)
          .forEach((pckg) => {
            pckg.vulnerabilities.forEach((v) => {
              const ruleId = 'nuget-dep-audit-' + pckg.id.toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');
              const msg = `Vulnerability: ${v.severity} \\n advisor ${v.advisoryurl}`;
              const sarifResultBuilder = new SarifResultBuilder();
              const sarifResultInit = {
                ruleId: ruleId,
                level: severityMap(v.severity),
                messageText: msg,
                // fileUri: 'file:///' + relative(rootDir.replaceAll('\\', '/'), project.path).replaceAll('\\', '/'),

                startLine: 1,
                startColumn: 1,
                endLine: 1,
                endColumn: 1,
              };

              sarifResultBuilder.initSimple(sarifResultInit);
              sarifResultBuilder.setLocationArtifactUri({
                uri: relative(rootDir.replaceAll('\\', '/'), project.path).replaceAll('\\', '/'),
                uriBaseId: 'ROOTPATH',
              });
              sarifRunBuilder.addResult(sarifResultBuilder);
              if (debug) {
                console.log(`rootDir: ${rootDir.replaceAll('\\', '/')}`);
                console.log(`project.path: ${project.path.replaceAll('\\', '/')}`);
                console.log(`${JSON.stringify(sarifResultInit)}\n================================`);
              }
            });
          });
      });
    });

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
