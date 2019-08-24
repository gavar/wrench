import { InputOptions } from "rollup";
import { findConfigFile, parseJsonConfigFileContent, ParseReportHost, readConfigFile } from "../host";
import { TypeScriptOptions } from "../typescript";
import { arrifyInput } from "../util";
import { Project } from "./project";

export function createProject(props: TypeScriptOptions, input: InputOptions): [Project, Set<string>] {
  const ts = props.typescript || require("typescript");
  const host = new ParseReportHost(ts);

  // find tsconfig
  const configPath = props.tsconfig || findConfigFile(host);

  // parse tsconfig
  const json = readConfigFile(configPath, host);

  // explicitly include only input files
  const entry = arrifyInput(input.input).map(host.getCanonicalFileName);
  json.include = [...entry];

  // parse configuration
  const pcl = parseJsonConfigFileContent(json, host, props.baseCompilerOptions);

  // create project
  const options = Object.assign({}, pcl.options, props.compilerOptions);
  const project = new Project({
    ts,
    options,
    fileNames: pcl.fileNames,
    currentDirectory: host.currentDirectory,
    transformerFactory: props.transformerFactory,
  });

  return [
    project,
    new Set(entry.map(project.getCanonicalFileName)),
  ];
}

