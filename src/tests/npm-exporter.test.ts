import fs from 'fs';
import { describe, expect, test } from '@jest/globals';
import exportSarif from '../npm-exporter';
import path from 'path';

describe('Npm exporter exportSarif module', () => {
  test('minimal file', () => {
    const outputFilePath = path.join(__dirname, './tmp/output/npm-exporter.json');
    exportSarif('./src/tests/data/npm-exporter.json', './tmp/output/npm-exporter.json', '');
    expect(fs.existsSync(outputFilePath));
  });
});
