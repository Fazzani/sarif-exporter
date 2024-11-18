import fs from 'fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../composer-exporter';
import path from 'path';

describe('Nuget exporter exportSarif module', () => {
  test('minimal file', () => {
    const outputFilePath = path.join(__dirname, './tmp/output/nuget-exporter.json');
    exportSarif('./src/tests/data/composer-exporter.json', outputFilePath, '');
    expect(fs.existsSync(outputFilePath));
  });
});
