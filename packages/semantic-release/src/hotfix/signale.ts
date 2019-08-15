import { Signale } from "signale";

export namespace signale {
  /**
   * Fix errors caused by invalid usage of {@link Signale}.
   * @see scope
   */
  export function hotfix(): void {
    Signale.prototype.scope = scope(Signale.prototype.scope);
  }

  /** Flattens input names of {@link Signale#scope} to avoid throwing error while formatting scope name. */
  export function scope(base: Signale["scope"]): Signale["scope"] {
    return function (this: Signale, ...names: string[]) {
      return base.apply(this, names.flat());
    };
  }
}
