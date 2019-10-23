declare namespace NodeJS {
  namespace Module {
    export function createRequire(path: string): NodeRequire;
  }
}
