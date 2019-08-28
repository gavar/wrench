# [1.0.0-beta.4](https://github.com/gavar/wrench/compare/v/semantic-release-ws/1.0.0-beta.3@beta...v/semantic-release-ws/1.0.0-beta.4@beta) (2019-08-28)


### Bug Fixes

* avoid passing passing this to array function as it may not work for some reason ([adcc3c4](https://github.com/gavar/wrench/commit/adcc3c4))
* do not create tag from previous release when using version from package ([412875e](https://github.com/gavar/wrench/commit/412875e))
* last release resolution ([fe1c1c7](https://github.com/gavar/wrench/commit/fe1c1c7))
* move own commits resolution to `semantic-release` package ([b7095be](https://github.com/gavar/wrench/commit/b7095be))
* parse last release version from the version itself ([f38ddcb](https://github.com/gavar/wrench/commit/f38ddcb))
* shouldAskToContinue ([b35729f](https://github.com/gavar/wrench/commit/b35729f))
* typings ([0b589c4](https://github.com/gavar/wrench/commit/0b589c4))
* update git head before publish ([39d8f3c](https://github.com/gavar/wrench/commit/39d8f3c))


### Features

* allow to explicitly define next release version ([091d139](https://github.com/gavar/wrench/commit/091d139))
* allow to override workspace plugin call ([60a102c](https://github.com/gavar/wrench/commit/60a102c))
* ask before switching to publish step ([74e6351](https://github.com/gavar/wrench/commit/74e6351))
* verify next release version is greater than last one ([b42fbe8](https://github.com/gavar/wrench/commit/b42fbe8))



# [1.0.0-beta.3](https://github.com/gavar/wrench/compare/v/semantic-release-ws/1.0.0-beta.2@beta...v/semantic-release-ws/1.0.0-beta.3@beta) (2019-08-28)


### Bug Fixes

* filtering workspace commits when tag excluded by global release tag ([2edf805](https://github.com/gavar/wrench/commit/2edf805))
* output paths ([4bcefe2](https://github.com/gavar/wrench/commit/4bcefe2))



# 1.0.0-beta.0 (2019-08-28)


### Bug Fixes

* createWorkspaceContext ([580fade](https://github.com/gavar/wrench/commit/580fade))
* git assets allows to use array as glob ([c538ad9](https://github.com/gavar/wrench/commit/c538ad9))
* improve release summary ([464346e](https://github.com/gavar/wrench/commit/464346e))
* missing import from util ([5768bab](https://github.com/gavar/wrench/commit/5768bab))
* move NpmConfig type to `@wrenhc/semantic-release-npm` ([a713480](https://github.com/gavar/wrench/commit/a713480))
* tag workspace only after publish ([960f43f](https://github.com/gavar/wrench/commit/960f43f))
* use exposed functions where possible ([2146afd](https://github.com/gavar/wrench/commit/2146afd))
* workspace tag invalid import ([0fe7c3d](https://github.com/gavar/wrench/commit/0fe7c3d))


### Features

* check if workspace pointing outside the working directory ([6168297](https://github.com/gavar/wrench/commit/6168297))
* createWorkspaceLogger ([3b606cb](https://github.com/gavar/wrench/commit/3b606cb))
* feat: `@wrench/semantic-release-ws` initial version ([453ca92](https://github.com/gavar/wrench/commit/453ca92))
* more common options ([9ab54bd](https://github.com/gavar/wrench/commit/9ab54bd))
* option to control interaction with GIT ([99b250f](https://github.com/gavar/wrench/commit/99b250f))
* push workspaces to remote on successful publish ([c374d1c](https://github.com/gavar/wrench/commit/c374d1c))
* rewrite `verify-release` step to avoid referencing context ([9e45d76](https://github.com/gavar/wrench/commit/9e45d76))
* rewrite analyze-commits step to avoid referencing context ([fa2f57f](https://github.com/gavar/wrench/commit/fa2f57f))
* workspace step execution hook ([e22e29c](https://github.com/gavar/wrench/commit/e22e29c))
