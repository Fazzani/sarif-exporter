# SARIF exporter

![ci workflow](https://github.com/Fazzani/sarif-exporter/actions/workflows/ci.yaml/badge.svg)
[![codecov](https://codecov.io/github/Fazzani/sarif-exporter/graph/badge.svg?token=k96Il1KJ94)](https://codecov.io/github/Fazzani/sarif-exporter)

---

## This is a [SARIF](https://sarifweb.azurewebsites.net/) exporter for several audit reports (NPM, NUGET)

## How to use

```shell
> sarif-exporter --help

Usage: index [options] <filename>

Arguments:
  filename                   Json source report path (Nuget/NPM/Composer(php))

Options:
  -f, --fileFormat <format>  Source file format (choices: "npm", "nuget", "composer", default: "npm")
  -o, --output <output>      SARIF Output filename path (default: "./sarif_output.json")
  -r, --rootDir <rootDir>    Project root directory (default: ".")
  -d, --debug                Enable debug
  -h, --help                 display help for command
```

## Accepted input files CLI

```shell
# dotnet cmd generate audit report
dotnet list project.sln package --vulnerable --include-transitive --format json > audit.json
# npm audit report
npm audit --json  > audit.json
# composer (php) audit report
composer audit --format=json
```

---

## References

- [How To Create An NPM Package](https://www.totaltypescript.com/how-to-create-an-npm-package)
- [Writing Your Own TypeScript CLI](https://dawchihliou.github.io/articles/writing-your-own-typescript-cli)
- [bandit: Python Sarif exporter](https://bandit.readthedocs.io/)
