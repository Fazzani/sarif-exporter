import fs from 'fs';
import path from 'path';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import NugetVulnerabilitiesReport, { VulnerabilitySeverity } from './nuget.models';

export function relative(rootDir: string, fullPath: string) {
  if (rootDir) {
    if (fullPath.toLowerCase().startsWith(rootDir.toLowerCase())) {
      return fullPath.substring(rootDir.length);
    }
  }
  return fullPath;
}

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

export default function exportSarif(filename: string, outputFilename: string, rootDir: string) {
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
              const ruleId = 'nuget-audit-' + pckg.id.toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');
              const msg =
                'Audit: ' + project.path + ' \n ' + framework.framework + ' \n ' + v.severity + ' \n ' + v.advisoryurl;
              const sarifResultBuilder = new SarifResultBuilder();
              const sarifResultInit = {
                ruleId: ruleId,
                level: severityMap(v.severity),
                messageText: msg,
                fileUri: relative(rootDir, project.path),

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
  } else {
    console.log(json);
  }
}