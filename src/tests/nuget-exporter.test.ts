import fs from 'fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../nuget-exporter';
import path from 'path';

describe('Nuget exporter exportSarif module', () => {
  test('minimal file', () => {
    const outputFilePath = path.join(__dirname, '../../tmp/output/nuget-exporter.json');
    exportSarif('./src/tests/data/nuget-exporter.json', outputFilePath, 'C:/a/1/s');
    expect(fs.existsSync(outputFilePath)).toBe(true);
    const stats = fs.statSync(outputFilePath);
    expect(stats.size).toBeGreaterThan(1024);
  });
});
