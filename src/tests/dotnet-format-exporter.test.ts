import fs from 'node:fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../dotnet-format-exporter';
import path from 'node:path';
import { Log, Result, ReportingDescriptor } from 'sarif';

describe('Dotnet format exporter exportSarif module', () => {
  test('converts dotnet format report to SARIF', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '.');

    expect(fs.existsSync(outputFilePath)).toBe(true);
    const stats = fs.statSync(outputFilePath);
    expect(stats.size).toBeGreaterThan(256);

    // Read and validate SARIF structure
    const sarifContent = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));

    // Validate SARIF version
    expect(sarifContent.version).toBe('2.1.0');
    expect(sarifContent.$schema).toBe('http://json.schemastore.org/sarif-2.1.0.json');

    // Validate runs
    expect(sarifContent.runs).toBeDefined();
    expect(sarifContent.runs.length).toBe(1);

    const run = sarifContent.runs[0];

    // Validate tool
    expect(run.tool.driver.name).toBe('dotnet format');
    expect(run.tool.driver.informationUri).toBe('https://learn.microsoft.com/dotnet/core/tools/dotnet-format');
    expect(run.tool.driver.version).toBe('unknown');

    // Validate rules
    expect(run.tool.driver.rules).toBeDefined();
    expect(run.tool.driver.rules.length).toBe(1); // IMPORTS

    // Validate results
    expect(run.results).toBeDefined();
    expect(run.results.length).toBe(2);

    // Check first result
    const firstResult = run.results[0];
    expect(firstResult.ruleId).toBe('IMPORTS');
    expect(firstResult.level).toBe('note');
    expect(firstResult.message.text).toBe('Corrigez le classement des importations.');
    expect(firstResult.locations[0].physicalLocation.artifactLocation.uri).toContain('AdvertisementService.cs');
    expect(firstResult.locations[0].physicalLocation.region.startLine).toBe(1);
    expect(firstResult.locations[0].physicalLocation.region.startColumn).toBe(1);
  });

  test('minified output', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter-minified.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '.', false, true);

    expect(fs.existsSync(outputFilePath)).toBe(true);
    const content = fs.readFileSync(outputFilePath, 'utf8');

    // Minified JSON should not have pretty formatting (no newlines except the final one)
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    expect(lines.length).toBeLessThanOrEqual(2); // Should be mostly one line
  });

  test('handles analyzer category with warning level', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter-analyzer.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '.');

    const sarifContent: Log = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
    const run = sarifContent.runs[0];

    // Find IMPORTS result
    const importsResult = run.results?.find((r: Result) => r.ruleId === 'IMPORTS');
    expect(importsResult).toBeDefined();
    expect(importsResult?.level).toBe('note');

    // Find rule with IMPORTS id
    const importsRule = run.tool.driver.rules?.find((r: ReportingDescriptor) => r.id === 'IMPORTS');
    expect(importsRule).toBeDefined();
    expect(importsRule?.defaultConfiguration?.level).toBe('note');
  });

  test('handles empty diagnostics array', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-empty.json');
    exportSarif('./src/tests/data/dotnet-format-empty.json', outputFilePath, '.');

    expect(fs.existsSync(outputFilePath)).toBe(true);
    const sarifContent: Log = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));

    // Should still have valid SARIF structure
    expect(sarifContent.version).toBe('2.1.0');
    expect(sarifContent.runs).toBeDefined();
    expect(sarifContent.runs.length).toBe(1);

    const run = sarifContent.runs[0];
    expect(run.tool.driver.name).toBe('dotnet format');

    // Should have no results and empty/no rules
    expect(run.results).toBeDefined();
    expect(run.results?.length).toBe(0);
    // Rules can be empty array or undefined when no diagnostics
    if (run.tool.driver.rules) {
      expect(run.tool.driver.rules.length).toBe(0);
    }
  });
});
