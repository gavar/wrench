declare namespace NodeJS {
  export namespace Module {
    export const _extensions: NodeExtensions;
    export function _resolveFilename(request: string, parent: NodeModule, main: boolean): string;
  }
}
