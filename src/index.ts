#!/usr/bin/env node
import { Command, Option } from 'commander';
import exportNpm from './npm-exporter';
import exportNuget from './nuget-exporter';
import exportComposer from './composer-exporter';
import exportDotnetFormat from './dotnet-format-exporter';

const errorColor = (
  str: string,
): string => // Add ANSI escape codes to display text in red.
  `\x1b[31m${str}\x1b[0m`;

async function run() {
  const program = new Command();

  program
    .argument('<filename>', 'Json source report path (Nuget/NPM/Composer(php)/dotnet format)')
    .addOption(
      new Option('-f, --fileFormat <format>', 'Source file format')
        .choices(['npm', 'nuget', 'composer', 'dotnet-format'])
        .default('npm'),
    )
    .option('-o, --output <output>', 'SARIF Output filename path', './sarif_output.json')
    .option('-r, --rootDir <rootDir>', 'Project root directory', '.')
    .option('-d, --debug', 'Enable debug')
    .option('-m, --minify', 'Minify SARIF output (no indentation)')
    .parse()
    .configureOutput({
      // Visibly override write routines as example!
      writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
      writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
      // Highlight errors in color.
      outputError: (str, write) => write(errorColor(str)),
    });

  const [filename] = program.args;
  const options = program.opts();

  console.log(
    `filename: ${filename}, output: ${options.output}, rootDir: ${options.rootDir}, fileFormat: ${options.fileFormat}, debug: ${options.debug}, minify: ${options.minify}`,
  );
  const format = (options.fileFormat as string).toLocaleLowerCase();
  const debugEnabled = options.debug !== undefined && options.debug !== null;
  const minifyEnabled = options.minify !== undefined && options.minify !== null;

  if (format == 'npm') exportNpm(filename, options.output, options.rootDir, debugEnabled);
  if (format == 'nuget') exportNuget(filename, options.output, options.rootDir, debugEnabled);
  if (format == 'composer') exportComposer(filename, options.output, options.rootDir, debugEnabled);
  if (format == 'dotnet-format')
    exportDotnetFormat(filename, options.output, options.rootDir, debugEnabled, minifyEnabled);

  console.log(`Output file is written into: ${options.output}`);
}

run();
