/// <reference path="../../node_modules/@types/node/index.d.ts" />

declare namespace NodeJS {
  export namespace Module {
    export const _extensions: NodeExtensions;
    export const _pathCache: Record<string, string>;
    export function _findPath(request: string, paths: string[], main: boolean): string;
    export function _resolveFilename(request: string, parent: NodeModule, main: boolean): string;
    export function createRequire(path: string): NodeRequire;
  }
}
