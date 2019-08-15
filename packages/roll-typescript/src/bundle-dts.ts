import { ExtractorConfig } from "@microsoft/api-extractor/lib/api/ExtractorConfig";
import { IExtractorMessagesConfig } from "@microsoft/api-extractor/lib/api/IConfigFile";
import { Collector } from "@microsoft/api-extractor/lib/collector/Collector";
import { MessageRouter } from "@microsoft/api-extractor/lib/collector/MessageRouter";
import { DtsRollupGenerator } from "@microsoft/api-extractor/lib/generators/DtsRollupGenerator";
import { INodePackageJson } from "@microsoft/node-core-library";
import path from "path";
import { Program } from "typescript";

export interface BundleDtsOptions {
  entry: string;
  output: string;
  program: Program;
}

export function bundleDts(options: BundleDtsOptions): void {
  const {program} = options;
  let {entry, output} = options;
  entry = path.resolve(entry);
  output = path.resolve(output);

  const extractorConfig = createExtractorConfig({
    mainEntryPointFilePath: entry,
    // fake options, does not affect on result
    packageFolder: "fake",
    projectFolder: "fake",
    packageJson: {name: "fake"},
  });

  const messageRouter = new MessageRouter({
    workingPackageFolder: void 0,
    messageCallback: void 0,
    messagesConfig: {},
    showVerboseMessages: false,
    showDiagnostics: false,
  });

  const collector = new Collector({
    program: program as any, // types may be incompatible if different TS versions
    messageRouter,
    extractorConfig,
  });
  collector.analyze();

  DtsRollupGenerator.writeTypingsFile(collector, output, 0);
}

/**
 * @see https://github.com/microsoft/web-build-tools/blob/master/apps/api-extractor/src/api/ExtractorConfig.ts#L93
 */
interface IExtractorConfigParameters {
  projectFolder: string;
  packageJson?: INodePackageJson;
  packageFolder?: string;
  mainEntryPointFilePath: string;
  tsconfigFilePath: string;
  overrideTsconfig?: {};
  skipLibCheck: boolean;
  apiReportEnabled: boolean;
  reportFilePath: string;
  reportTempFilePath: string;
  docModelEnabled: boolean;
  apiJsonFilePath: string;
  rollupEnabled: boolean;
  untrimmedFilePath: string;
  betaTrimmedFilePath: string;
  publicTrimmedFilePath: string;
  omitTrimmingComments: boolean;
  tsdocMetadataEnabled: boolean;
  tsdocMetadataFilePath: string;
  messages: IExtractorMessagesConfig;
  testMode: boolean;
}

function createExtractorConfig(params: Partial<IExtractorConfigParameters>): ExtractorConfig {
  return Reflect.construct(ExtractorConfig, [params]);
}
