declare module "@semantic-release/error" {
  declare class SemanticReleaseError extends Error {
    name: string;
    message: string;
    code: string;
    details: string;
    constructor(message: string, code: string, details?: string);
  }

  export = SemanticReleaseError;
}
