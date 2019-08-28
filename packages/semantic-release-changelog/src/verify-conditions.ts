import { VerifyConditionsContext } from "@wrench/semantic-release";
import { defaults } from "lodash";
import { DEFAULT_CONFIG } from "./common";
import { ChangelogConfig } from "./types";

const $verify = require("@semantic-release/changelog/lib/verify");

export async function verifyConditions(config: ChangelogConfig, context: VerifyConditionsContext) {
  defaults(config, DEFAULT_CONFIG);
  $verify(config, context);
}
