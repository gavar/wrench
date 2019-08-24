/**
 * Semantic Release throws an error when `publish` step returns an array.
 * This hotfix hijacks validation of the return object since each workspace
 * have its own release resulting in array of releases from a single step.
 */
export function allowPublishReleaseArray(importer: NodeRequire = require) {
  const {publish} = importer("semantic-release/lib/definitions/plugins");
  const {outputValidator} = publish;
  const config = publish.pipelineConfig();

  publish.outputValidator = function (output: any) {
    // when each item separately when array
    return Array.isArray(output)
      ? output.every(outputValidator)
      : outputValidator(output);
  };

  publish.postprocess = function (output: any) {
    // flatten all plugins into single array
    return Array.isArray(output)
      ? output.flat()
      : output;
  };

  publish.pipelineConfig = function () {
    return {
      ...config,
      transform(release: any, ...args: any[]) {
        // leave array as is as it's already transformed by plugin itself
        return Array.isArray(release)
          ? release
          : config.transform.call(this, release, ...args);
      },
    };
  };
}
