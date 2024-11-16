# SARIF exporter

This is a [SARIF](https://sarifweb.azurewebsites.net/) exporter for several audit reports (NPM, NUGET, PIP-AUDIT)

```shell
> sarif-exporter --help

Usage: index [options] <filename>

Arguments:
  filename                   Json source report path (Nuget/NPM/PIP).

Options:
  -f, --fileFormat <format>  Source file format (choices: "npm", "nuget", "pip", default: "npm")
  -o, --output <output>      SARIF Output filename path (default: "./sarif_output.json")
  -r, --rootDir <rootDir>    Project root directory (default: ".")
  -h, --help                 display help for command
```

```shell
# dotnet cmd generate audit report
dotnet list project.sln package --vulnerable --include-transitive --format json > audit.json
# npm audit report
npm audit --json
```

## References

- [How To Create An NPM Package](https://www.totaltypescript.com/how-to-create-an-npm-package)
- [Writing Your Own TypeScript CLI](https://dawchihliou.github.io/articles/writing-your-own-typescript-cli)
