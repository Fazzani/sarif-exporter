# SARIF exporter

![ci workflow](https://github.com/Fazzani/sarif-exporter/actions/workflows/ci.yaml/badge.svg)
[![codecov](https://codecov.io/github/Fazzani/sarif-exporter/graph/badge.svg?token=k96Il1KJ94)](https://codecov.io/github/Fazzani/sarif-exporter)

---

## This is a [SARIF](https://sarifweb.azurewebsites.net/) exporter for several audit reports (NPM, NUGET, COMPOSER) and dotnet format reports

## How to use

```shell
> sarif-exporter --help

Usage: index [options] <filename>

Arguments:
  filename                   Json source report path (Nuget/NPM/Composer(php)/dotnet format)

Options:
  -f, --fileFormat <format>  Source file format (choices: "npm", "nuget", "composer", "dotnet-format", default: "npm")
  -o, --output <output>      SARIF Output filename path (default: "./sarif_output.json")
  -r, --rootDir <rootDir>    Project root directory (default: ".")
  -d, --debug                Enable debug
  -m, --minify               Minify SARIF output (no indentation)
  -h, --help                 display help for command
```

## Accepted input files CLI

```shell
# dotnet cmd generate audit report
dotnet list project.sln package --vulnerable --include-transitive --format json > audit.json
# npm audit report
npm audit --json  > audit.json
# composer (php) audit report
composer audit --format=json  > audit.json
# dotnet format report
dotnet format --verify-no-changes --report format-report.json --report-format json
```

## Examples

### Convert dotnet format report to SARIF

```shell
# Generate dotnet format report
dotnet format --verify-no-changes --report format-report.json --report-format json

# Convert to SARIF
sarif-export format-report.json -f dotnet-format -o format-results.sarif

# With minified output
sarif-export format-report.json -f dotnet-format -o format-results.sarif -m
```

---

## References

- [How To Create An NPM Package](https://www.totaltypescript.com/how-to-create-an-npm-package)
- [Writing Your Own TypeScript CLI](https://dawchihliou.github.io/articles/writing-your-own-typescript-cli)
- [bandit: Python Sarif exporter](https://bandit.readthedocs.io/)
- [KICS for infrastructure](https://www.kics.io/#supportedplatforms)
