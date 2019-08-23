/// <reference path="../../node_modules/@types/node/index.d.ts" />

declare namespace NodeJS {
  export namespace Module {
    export const _extensions: NodeExtensions;
    export function createRequire(path: string): NodeRequire;
  }
}
