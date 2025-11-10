import fs from 'fs';
import path from 'path';
import { SarifBuilder, SarifRunBuilder, SarifRuleBuilder, SarifResultBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { DotnetFormatReport, DotnetFormatDiagnostic } from './dotnet-format.models';
import { relative } from './common';

const categoryToSeverity = (category: string): Result.level => {
  switch (category.toLowerCase()) {
    case 'style':
    case 'whitespace':
      return 'note';
    case 'analyzer':
      return 'warning';
    default:
      return 'note';
  }
};

const getRuleDescription = (ruleId: string): string => {
  // Common rule descriptions based on well-known dotnet format rules
  const descriptions: { [key: string]: string } = {
    IDE0055: 'Format code to follow style conventions',
    IDE0001: 'Simplify name',
    IDE0002: 'Simplify member access',
    IDE0003: 'Remove this or Me qualification',
    IDE0004: 'Remove unnecessary cast',
    IDE0005: 'Remove unnecessary imports',
  };
  return descriptions[ruleId] || 'Code formatting or style issue';
};

export default function exportSarif(
  filename: string,
  outputFilename: string,
  rootDir: string,
  debug: boolean = false,
  minify: boolean = false,
) {
  const report: DotnetFormatReport = JSON.parse(fs.readFileSync(filename, 'utf8'));

  // SARIF builder
  const sarifBuilder = new SarifBuilder();

  // SARIF Run builder
  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'dotnet format',
    toolDriverVersion: report.version || 'unknown',
    url: 'https://learn.microsoft.com/dotnet/core/tools/dotnet-format',
  });

  // Track unique rules to avoid duplicates
  const addedRules = new Set<string>();

  // Add rules and results
  report.diagnostics.forEach((diagnostic: DotnetFormatDiagnostic) => {
    const ruleId = diagnostic.ruleId;

    // Add rule if not already added
    if (!addedRules.has(ruleId)) {
      const ruleBuilder = new SarifRuleBuilder();
      ruleBuilder.initSimple({
        ruleId: ruleId,
        shortDescriptionText: getRuleDescription(ruleId),
        fullDescriptionText: getRuleDescription(ruleId),
      });

      // Add rule properties
      ruleBuilder.rule.name = diagnostic.message;
      ruleBuilder.rule.defaultConfiguration = {
        level: categoryToSeverity(diagnostic.category),
      };
      ruleBuilder.rule.properties = {
        category: diagnostic.category,
      };

      sarifRunBuilder.addRule(ruleBuilder);
      addedRules.add(ruleId);
    }

    // Create result for this diagnostic
    const sarifResultBuilder = new SarifResultBuilder();
    const sarifResultInit = {
      ruleId: ruleId,
      level: categoryToSeverity(diagnostic.category),
      messageText: diagnostic.message,
      fileUri: relative(rootDir, diagnostic.filePath),
      startLine: diagnostic.startLine || 1,
      startColumn: diagnostic.startColumn || 1,
      endLine: diagnostic.endLine || diagnostic.startLine || 1,
      endColumn: diagnostic.endColumn || diagnostic.startColumn || 1,
    };

    sarifResultBuilder.initSimple(sarifResultInit);
    sarifRunBuilder.addResult(sarifResultBuilder);

    if (debug) {
      console.log(`${JSON.stringify(sarifResultInit)}\n================================`);
    }
  });

  sarifBuilder.addRun(sarifRunBuilder);

  const json = sarifBuilder.buildSarifJsonString({ indent: !minify });

  if (outputFilename) {
    const parentDirectory = path.dirname(outputFilename);
    if (!fs.existsSync(parentDirectory)) fs.mkdirSync(parentDirectory, { recursive: true });
    fs.writeFileSync(outputFilename, json);
    if (debug) console.log(json);
  } else {
    console.log(json);
  }
}
