import fs from 'fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../dotnet-format-exporter';
import path from 'path';
import { Log, Result, ReportingDescriptor } from 'sarif';

describe('Dotnet format exporter exportSarif module', () => {
  test('converts dotnet format report to SARIF', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '.');

    expect(fs.existsSync(outputFilePath)).toBe(true);
    const stats = fs.statSync(outputFilePath);
    expect(stats.size).toBeGreaterThan(1024);

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
    expect(run.tool.driver.version).toBe('8.0.100');

    // Validate rules
    expect(run.tool.driver.rules).toBeDefined();
    expect(run.tool.driver.rules.length).toBe(2); // IDE0055 and CA1822

    // Validate results
    expect(run.results).toBeDefined();
    expect(run.results.length).toBe(4);

    // Check first result
    const firstResult = run.results[0];
    expect(firstResult.ruleId).toBe('IDE0055');
    expect(firstResult.level).toBe('note'); // style category
    expect(firstResult.message.text).toBe('Fix formatting issue');
    expect(firstResult.locations[0].physicalLocation.artifactLocation.uri).toBe('Program.cs');
    expect(firstResult.locations[0].physicalLocation.region.startLine).toBe(12);
    expect(firstResult.locations[0].physicalLocation.region.startColumn).toBe(5);
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

    // Find CA1822 result (analyzer category)
    const analyzerResult = run.results?.find((r: Result) => r.ruleId === 'CA1822');
    expect(analyzerResult).toBeDefined();
    expect(analyzerResult?.level).toBe('warning'); // analyzer category

    // Find rule with analyzer category
    const analyzerRule = run.tool.driver.rules?.find((r: ReportingDescriptor) => r.id === 'CA1822');
    expect(analyzerRule).toBeDefined();
    expect(analyzerRule?.defaultConfiguration?.level).toBe('warning');
    expect(analyzerRule?.properties?.category).toBe('analyzer');
  });
});
