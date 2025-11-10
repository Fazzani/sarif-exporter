import fs from 'node:fs';
import path from 'node:path';
import { SarifBuilder, SarifResultBuilder, SarifRunBuilder, SarifRuleBuilder } from 'node-sarif-builder';
import { Result } from 'sarif';
import { DotnetFormatReport } from './dotnet-format.models';

/**
 * Adds a rule to the SARIF run builder if not already seen
 */
function addRuleIfNeeded(
  ruleId: string,
  description: string,
  seenRules: Set<string>,
  sarifRunBuilder: SarifRunBuilder,
  debug: boolean,
) {
  if (!seenRules.has(ruleId)) {
    seenRules.add(ruleId);

    const ruleBuilder = new SarifRuleBuilder();
    ruleBuilder.initSimple({
      ruleId: ruleId,
      shortDescriptionText: description,
      fullDescriptionText: description,
    });

    ruleBuilder.rule.defaultConfiguration = {
      level: 'note' as Result.level,
    };

    sarifRunBuilder.addRule(ruleBuilder);

    if (debug) {
      console.log(`Added rule: ${ruleId}`);
    }
  }
}

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
    toolDriverVersion: 'unknown',
    url: 'https://learn.microsoft.com/dotnet/core/tools/dotnet-format',
  });

  // Track unique rules to add them to the driver
  const seenRules = new Set<string>();

  // Process each diagnostic entry
  for (const diagnostic of report) {
    // Process each file change within the diagnostic
    for (const change of diagnostic.FileChanges) {
      const ruleId = change.DiagnosticId;
      const level = 'note' as Result.level;

      addRuleIfNeeded(ruleId, change.FormatDescription, seenRules, sarifRunBuilder, debug);

      // Create result for this file change
      const sarifResultBuilder = new SarifResultBuilder();
      const sarifResultInit = {
        ruleId: ruleId,
        level: level,
        messageText: change.FormatDescription,
        fileUri: diagnostic.FilePath.replaceAll('\\', '/'),
        startLine: change.LineNumber,
        startColumn: change.CharNumber,
      };

      sarifResultBuilder.initSimple(sarifResultInit);
      sarifRunBuilder.addResult(sarifResultBuilder);

      if (debug) {
        console.log(`Added result for ${diagnostic.FilePath}:${change.LineNumber}:${change.CharNumber}`);
      }
    }
  }

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
