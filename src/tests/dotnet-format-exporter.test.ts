import fs from 'fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../dotnet-format-exporter';
import path from 'path';

describe('Dotnet format exporter exportSarif module', () => {
  test('converts dotnet format report to SARIF', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '');
    expect(fs.existsSync(outputFilePath)).toBe(true);
    const stats = fs.statSync(outputFilePath);
    expect(stats.size).toBeGreaterThan(1024);
  });

  test('SARIF output contains correct structure', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter-structure.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '');

    const sarifContent = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));

    // Check SARIF version and schema
    expect(sarifContent.version).toBe('2.1.0');
    expect(sarifContent.$schema).toBe('http://json.schemastore.org/sarif-2.1.0.json');

    // Check runs array
    expect(sarifContent.runs).toBeDefined();
    expect(sarifContent.runs.length).toBe(1);

    const run = sarifContent.runs[0];

    // Check tool driver
    expect(run.tool.driver.name).toBe('dotnet format');
    expect(run.tool.driver.informationUri).toBe('https://learn.microsoft.com/dotnet/core/tools/dotnet-format');
    expect(run.tool.driver.version).toBe('8.0.100');

    // Check rules
    expect(run.tool.driver.rules).toBeDefined();
    expect(run.tool.driver.rules.length).toBeGreaterThan(0);

    // Check results
    expect(run.results).toBeDefined();
    expect(run.results.length).toBe(4);

    // Check first result structure
    const firstResult = run.results[0];
    expect(firstResult.ruleId).toBe('IDE0055');
    expect(firstResult.level).toBe('note');
    expect(firstResult.message.text).toBe('Fix formatting issue');
    expect(firstResult.locations).toBeDefined();
    expect(firstResult.locations[0].physicalLocation.artifactLocation.uri).toBe('Program.cs');
    expect(firstResult.locations[0].physicalLocation.region.startLine).toBe(12);
    expect(firstResult.locations[0].physicalLocation.region.startColumn).toBe(5);
  });

  test('handles minify option', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/dotnet-format-exporter-minified.json');
    exportSarif('./src/tests/data/dotnet-format-exporter.json', outputFilePath, '', false, true);

    const content = fs.readFileSync(outputFilePath, 'utf8');
    // Minified JSON should not contain newlines or multiple spaces
    expect(content.includes('\n')).toBe(false);
    expect(fs.existsSync(outputFilePath)).toBe(true);
  });
});
