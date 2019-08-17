import { Context } from "@wrench/semantic-release";
import { NpmConfig } from "./common";

const $addChannel = require("@semantic-release/npm/lib/add-channel");

export async function addChannel(config: NpmConfig, context: Context) {
  // BUG: run directly, verification logic of `semantic-release/npm` is broken
  return $addChannel(config, context);
}
