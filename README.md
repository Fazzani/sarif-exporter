# sarif-exporter

An exporter for several audit reports (NPM, NuGet, Composer) — converts scanner/audit outputs into SARIF (Static Analysis Results Interchange Format) so they can be imported into security dashboards and CI pipelines.

[![build status](https://img.shields.io/badge/build-pending-lightgrey)](https://github.com/Fazzani/sarif-exporter/actions)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Table of contents
- [Overview](#overview)
- [Supported exporters](#supported-exporters)
- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
  - [Local development](#local-development)
  - [Production / CI usage](#production--ci-usage)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Quick example (recommended)](#quick-example-recommended)
  - [Command-line (CLI)](#command-line-cli)
  - [Programmatic API](#programmatic-api)
- [Configuration options](#configuration-options)
- [Contributing](#contributing)
- [License](#license)
- [Maintainers / Contact](#maintainers--contact)

## Overview
sarif-exporter normalizes vulnerability and audit outputs from package managers (npm, NuGet, Composer, etc.) into SARIF v2.1.0 so results can be consumed by security dashboards, code scanning uploaders, or CI steps that understand SARIF.

Written primarily in TypeScript, the project is designed to be extendable to additional input formats.

## Supported exporters
The project includes converters (exporters) for the following input formats:

- NPM (npm audit / npm audit --json)
  - Typical input: output of `npm audit --json` or similar JSON audits.
  - Notes: Maps npm advisories, vulnerable ranges and dependency paths into SARIF results.

- NuGet (dotnet / NuGet audit outputs)
  - Typical input: NuGet/Dependabot or `dotnet list package --vulnerable` JSON (or other JSON formats produced by NuGet scanning tools).
  - Notes: Normalizes package identifiers, CVE/Advisory metadata and affected versions.

- Composer (composer audit)
  - Typical input: `composer audit --format=json` or other Composer scanner JSON outputs.
  - Notes: Converts Composer advisories and package version ranges into SARIF.

- dotnet-format (dotnet format JSON report)
  - Typical input: `dotnet format --report <path> --report-format json` output.
  - Notes: Converts dotnet format diagnostics (style, whitespace, analyzer) into SARIF results, preserving rule IDs, locations and severity mapping.
  - CLI example:
    ```bash
    npx sarif-exporter ./audit.json -f dotnet-format -o ./report.sarif
    ```
    This command reads `./audit.json` produced by dotnet-format and writes the SARIF result to `./report.sarif`.

- Generic / Custom JSON
  - A flexible importer that can be adapted for other JSON audit formats. Useful for vendor-specific scanners where fields can be mapped via a small adapter.

If you'd like additional exporters added (Yarn, Snyk, Trivy, OS package scanners, etc.), open an issue or PR with an example input file and expected SARIF mapping.

## Features
- Convert audit/scan reports from NPM, NuGet, Composer and dotnet-format to SARIF v2.1.0
- CLI for easy integration in pipelines
- Programmatic API for embedding in tools or scripts
- Configurable behavior (log level, fail-on-error, etc.)
- Extensible converters for additional formats

## Requirements
- Node.js >= 16
- npm or pnpm
- (Optional) Docker for containerized CI runs

## Setup

### Local development
1. Clone the repository
```bash
git clone https://github.com/Fazzani/sarif-exporter.git
cd sarif-exporter
```

2. Install dependencies
```bash
npm ci
# or
pnpm install
```

3. Build the TypeScript sources
```bash
npm run build
```

4. Run tests and static checks
```bash
npm test
npm run lint
```

5. Start in development mode (if available)
```bash
npm run dev
```

### Production / CI usage
- If the package is published to npm:
```bash
# Run without installing globally
npx sarif-exporter ./audit.json -f nuget -o ./report.sarif

# Or install globally
npm install -g sarif-exporter
sarif-exporter ./audit.json -f nuget -o ./report.sarif
```

- If running from the repository in CI:
```bash
npm ci
npm run build
node dist/cli.js ./audit.json -f nuget -o ./report.sarif
```

### Configuration
Behavior can be configured by:
- CLI flags
- A configuration file (JSON/YAML), e.g. `sarif-config.json`
- Environment variables (example: SARIF_EXPORTER_LOG_LEVEL)

Minimal `sarif-config.json` example:
```json
{
  "input": "./audit.json",
  "format": "nuget",
  "output": "./report.sarif",
  "sarifVersion": "2.1.0",
  "failOnError": false,
  "logLevel": "info"
}
```

## Usage

### Quick example (recommended)
Run the exporter with npx (convenient for CI or one-off conversions):
```bash
npx sarif-exporter ./audit.json -f nuget -o ./report.sarif
```
This command reads `./audit.json` (NuGet format) and writes the SARIF result to `./report.sarif`.

### Command-line (CLI)
Common usage patterns:
```bash
# Using explicit flags
npx sarif-exporter --input ./audit.json --format nuget --output ./report.sarif

# Using short flags
npx sarif-exporter ./audit.json -f nuget -o ./report.sarif

# Using a config file
npx sarif-exporter --config ./sarif-config.json
```

Common CLI options
- --input, -i : path to input report file (positional input file is also supported)
- --format, -f : input format (npm | nuget | composer | dotnet-format)
- --output, -o : path for generated SARIF file
- --config, -c : path to configuration file (JSON/YAML)
- --log-level : debug | info | warn | error
- --fail-on-error : exit with non-zero status if conversion fails
- --help : show usage information

Run the CLI help to see the exact flags your installed version exposes:
```bash
npx sarif-exporter --help
```

### Programmatic API
Example TypeScript usage:
```ts
import { convertReportToSarif } from 'sarif-exporter'; // or from './dist' when local

async function run() {
  const sarif = await convertReportToSarif({
    inputPath: './audit.json',
    format: 'nuget',
    sarifVersion: '2.1.0'
  });
  // write sarif object to disk or return it
}
run();
```

API options (typical)
- inputPath: string
- format: 'npm' | 'nuget' | 'composer' | 'dotnet-format' | string
- outputPath?: string
- sarifVersion?: string (default "2.1.0")
- failOnError?: boolean
- logLevel?: 'debug'|'info'|'warn'|'error'

## Configuration options
- inputPath (string) — path to the input report
- format (string) — one of npm, nuget, composer, dotnet-format
- outputPath (string) — path for the SARIF file (if omitted, function returns SARIF object)
- sarifVersion (string) — SARIF spec version (default 2.1.0)
- failOnError (boolean) — exit non-zero when conversion fails
- logLevel (string) — logging verbosity

## Contributing
Contributions are welcome:
- Fork the repo, create a feature branch (feature/<name>)
- Add tests for new converters or features
- Run lint and tests locally
- Open a pull request with a clear description and rationale

Helpful commands:
```bash
npm ci
npm run lint
npm run build
npm test
```

Please follow existing TypeScript styles and include unit tests for new converters.

## License
MIT — see the LICENSE file.

## Maintainers / Contact
Maintainer: Fazzani — https://github.com/Fazzani
