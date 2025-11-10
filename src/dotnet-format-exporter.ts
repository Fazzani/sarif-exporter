import fs from 'fs';
import path from 'path';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder, SarifRuleBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { DotnetFormatReport, DiagnosticCategory } from './dotnet-format.models';

/**
 * Maps dotnet format diagnostic category to SARIF severity level
 */
const categoryToLevel = (category: DiagnosticCategory): Result.level => {
  switch (category) {
    case 'style':
    case 'whitespace':
      return 'note';
    case 'analyzer':
      return 'warning';
    default:
      return 'note';
  }
};

/**
 * Exports dotnet format JSON report to SARIF 2.1.0 format
 * @param filename - Path to dotnet format JSON report file
 * @param outputFilename - Path where SARIF output should be written
 * @param rootDir - Project root directory for relative paths
 * @param debug - Enable debug logging
 * @param minify - Output minified JSON without indentation
 */
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

  // SARIF Run builder with dotnet format tool information
  const sarifRunBuilder = new SarifRunBuilder().initSimple({
    toolDriverName: 'dotnet format',
    toolDriverVersion: report.version || 'unknown',
    url: 'https://learn.microsoft.com/dotnet/core/tools/dotnet-format',
  });

  // Track unique rules to add them to the driver
  const seenRules = new Set<string>();

  // Process each diagnostic
  report.diagnostics.forEach((diagnostic) => {
    const ruleId = diagnostic.ruleId;
    const level = categoryToLevel(diagnostic.category);

    // Add rule if not seen before
    if (!seenRules.has(ruleId)) {
      seenRules.add(ruleId);

      const ruleBuilder = new SarifRuleBuilder();
      ruleBuilder.initSimple({
        ruleId: ruleId,
        shortDescriptionText: diagnostic.message,
        fullDescriptionText: `Format code to follow ${diagnostic.category} conventions`,
      });

      // Set default configuration level
      ruleBuilder.rule.defaultConfiguration = {
        level: level,
      };

      // Add category as property
      ruleBuilder.rule.properties = {
        category: diagnostic.category,
      };

      sarifRunBuilder.addRule(ruleBuilder);

      if (debug) {
        console.log(`Added rule: ${ruleId} (${diagnostic.category}) with level: ${level}`);
      }
    }

    // Create result for this diagnostic
    const sarifResultBuilder = new SarifResultBuilder();
    const sarifResultInit = {
      ruleId: ruleId,
      level: level,
      messageText: diagnostic.message,
      fileUri: diagnostic.filePath.replace(/\\/g, '/'),
      startLine: diagnostic.startLine,
      startColumn: diagnostic.startColumn,
      endLine: diagnostic.endLine,
      endColumn: diagnostic.endColumn,
    };

    sarifResultBuilder.initSimple(sarifResultInit);
    sarifRunBuilder.addResult(sarifResultBuilder);

    if (debug) {
      console.log(`Added result for ${diagnostic.filePath}:${diagnostic.startLine}:${diagnostic.startColumn}`);
    }
  });

  sarifBuilder.addRun(sarifRunBuilder);

  // Build SARIF JSON string with optional minification
  const json = sarifBuilder.buildSarifJsonString({ indent: !minify });

  // Write output
  if (outputFilename) {
    const parentDirectory = path.dirname(outputFilename);
    if (!fs.existsSync(parentDirectory)) {
      fs.mkdirSync(parentDirectory, { recursive: true });
    }
    fs.writeFileSync(outputFilename, json);
    if (debug) {
      console.log(`SARIF file written to: ${outputFilename}`);
      console.log(json);
    }
  } else {
    console.log(json);
  }
}
