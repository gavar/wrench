import {
  AnalyzeCommitsContext,
  Context,
  GenerateNotesContext,
  PrepareContext,
  PublishContext,
  SuccessContext,
  VerifyConditionsContext,
  VerifyReleaseContext,
} from "./contex";
import { Release, ReleaseType } from "./release";

/**
 * Plugin step type.
 * @see https://semantic-release.gitbook.io/semantic-release/v/beta/usage/plugins
 */
export type Step =
  | "verifyConditions"
  | "analyzeCommits"
  | "verifyRelease"
  | "generateNotes"
  | "prepare"
  | "publish"
  | "success"
  | "fail";

/**
 * Defines what kind of context provided for the particular release step.
 */
export interface ContextType {
  verifyConditions: VerifyConditionsContext;
  analyzeCommits: AnalyzeCommitsContext;
  verifyRelease: VerifyReleaseContext;
  generateNotes: GenerateNotesContext;
  prepare: PrepareContext;
  publish: PublishContext;
  success: SuccessContext;
  fail: Context;
}

/** Set of release steps available for implementation by plugin. */
export interface Plugin<T = unknown> {
  verifyConditions(config: T, context: VerifyConditionsContext): Promise<void>;
  analyzeCommits(config: T, context: AnalyzeCommitsContext): Promise<ReleaseType>;
  verifyRelease(config: T, context: VerifyReleaseContext): Promise<void>;
  generateNotes(config: T, context: GenerateNotesContext): Promise<string>;
  prepare(config: T, context: PrepareContext): Promise<void>;
  publish(config: T, context: PublishContext): Promise<void | null | false | Partial<Release>>;
  success(config: T, context: SuccessContext): Promise<void>;
  fail(config: T, context: Context): Promise<void>;
}

/** Return type of the particular release step of {@link Plugin}. */
export type PluginReturnType<S extends Step> = Plugin[S] extends (...args: any) => Promise<infer T> ? T : never;

/** All plugins steps available as a single function invocation receiving context as first argument. */
export interface Plugins {
  verifyConditions(context: VerifyConditionsContext): Promise<void>;
  analyzeCommits(context: AnalyzeCommitsContext): Promise<ReleaseType>;
  verifyRelease(context: VerifyReleaseContext): Promise<void>;
  generateNotes(context: GenerateNotesContext): Promise<string>;
  prepare(context: PrepareContext): Promise<void>;
  publish(context: PublishContext): Promise<Release[]>;
  success(context: SuccessContext): Promise<void>;
  fail(context: Context): Promise<void>;
}

/** Return type of the particular release step of {@link Plugins}. */
export type PluginsReturnType<S extends Step> = Plugins[S] extends (...args: any) => Promise<infer T> ? T : never;

/** Defines function signature for particular step of {@link Plugins}. */
export type PluginsFunction<S extends Step> = (context: ContextType[S]) => Promise<PluginsReturnType<S>>;
