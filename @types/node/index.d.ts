/// <reference path="../../../node_modules/@types/node/index.d.ts" />

declare namespace NodeJS {
  export namespace Module {
    export function createRequire(path: string): NodeRequire;
  }
}
