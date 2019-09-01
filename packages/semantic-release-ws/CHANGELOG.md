## [0.0.6](https://github.com/gavar/wrench/compare/v/semantic-release-ws/0.0.5...v/semantic-release-ws/0.0.6) (2019-09-01)


### Bug Fixes

* use release version of `[@emulsy](https://github.com/emulsy)` ([688af88](https://github.com/gavar/wrench/commit/688af88))

## [0.0.5](https://github.com/gavar/wrench/compare/v/semantic-release-ws/0.0.4...v/semantic-release-ws/0.0.5) (2019-08-31)


### Bug Fixes

* constraints for dependencies with major version less than 1 ([0a500e9](https://github.com/gavar/wrench/commit/0a500e9))

## [0.0.4](https://github.com/gavar/wrench/compare/v/semantic-release-ws/0.0.3...v/semantic-release-ws/0.0.4) (2019-08-31)


### Bug Fixes

* next version resolution ([c9209b5](https://github.com/gavar/wrench/commit/c9209b5))
* parse version channel when using last release version from package ([5a8f970](https://github.com/gavar/wrench/commit/5a8f970))



## [0.0.3](https://github.com/gavar/wrench/compare/v/semantic-release-ws/0.0.2...v/semantic-release-ws/0.0.3) (2019-08-31)


### Bug Fixes

* call `version` and `pack` only for workspaces having next release ([1ada131](https://github.com/gavar/wrench/commit/1ada131))



## [0.0.2](https://github.com/gavar/wrench/compare/v/semantic-release-ws/0.0.1...v/semantic-release-ws/0.0.2) (2019-08-31)


### Bug Fixes

* `forceRelease` option type definition ([84f137f](https://github.com/gavar/wrench/commit/84f137f))
* last / next release resolution ([f1885fe](https://github.com/gavar/wrench/commit/f1885fe))
* rename workspace `package` property to `pack` ([7af371e](https://github.com/gavar/wrench/commit/7af371e))
* update dependencies ([956658c](https://github.com/gavar/wrench/commit/956658c))
* version comparison to exclude release from publishing ([c36ea00](https://github.com/gavar/wrench/commit/c36ea00))


### Features

* `reduceReleaseType` option ([dbad44a](https://github.com/gavar/wrench/commit/dbad44a))
* introduce `LastRelease` type ([a82085b](https://github.com/gavar/wrench/commit/a82085b))
* introduce `version` and `pack` hooks as part of `prepare` ([778e0ae](https://github.com/gavar/wrench/commit/778e0ae))
* math methods for `ReleaseType` ([bbf346a](https://github.com/gavar/wrench/commit/bbf346a))



## 0.0.1 (2019-08-31)


### Bug Fixes

* avoid passing passing this to array function as it may not work for some reason ([adcc3c4](https://github.com/gavar/wrench/commit/adcc3c4))
* createWorkspaceContext ([580fade](https://github.com/gavar/wrench/commit/580fade))
* do not create tag from previous release when using version from package ([412875e](https://github.com/gavar/wrench/commit/412875e))
* do not print workspaces list ([a17a919](https://github.com/gavar/wrench/commit/a17a919))
* filtering workspace commits when tag excluded by global release tag ([2edf805](https://github.com/gavar/wrench/commit/2edf805))
* git assets allows to use array as glob ([c538ad9](https://github.com/gavar/wrench/commit/c538ad9))
* improve release summary ([464346e](https://github.com/gavar/wrench/commit/464346e))
* last release resolution ([fe1c1c7](https://github.com/gavar/wrench/commit/fe1c1c7))
* missing import from util ([5768bab](https://github.com/gavar/wrench/commit/5768bab))
* missing invoke of `preProcessWorkspaces` hook ([fcb3c11](https://github.com/gavar/wrench/commit/fcb3c11))
* move NpmConfig type to `@wrenhc/semantic-release-npm` ([a713480](https://github.com/gavar/wrench/commit/a713480))
* move own commits resolution to `semantic-release` package ([b7095be](https://github.com/gavar/wrench/commit/b7095be))
* output paths ([4bcefe2](https://github.com/gavar/wrench/commit/4bcefe2))
* parse last release version from the version itself ([f38ddcb](https://github.com/gavar/wrench/commit/f38ddcb))
* rename `version` option to `forceRelease` to avoid conflict with CLI ([46eed1b](https://github.com/gavar/wrench/commit/46eed1b))
* shouldAskToContinue ([4f6e679](https://github.com/gavar/wrench/commit/4f6e679))
* shouldAskToContinue ([b35729f](https://github.com/gavar/wrench/commit/b35729f))
* tag workspace only after publish ([960f43f](https://github.com/gavar/wrench/commit/960f43f))
* typings ([0b589c4](https://github.com/gavar/wrench/commit/0b589c4))
* update git head before publish ([39d8f3c](https://github.com/gavar/wrench/commit/39d8f3c))
* updating workspaces head before publish ([5ee9af0](https://github.com/gavar/wrench/commit/5ee9af0))
* use exposed functions where possible ([2146afd](https://github.com/gavar/wrench/commit/2146afd))
* workspace tag invalid import ([0fe7c3d](https://github.com/gavar/wrench/commit/0fe7c3d))


### Features

* allow to explicitly define next release version ([091d139](https://github.com/gavar/wrench/commit/091d139))
* allow to override workspace plugin call ([60a102c](https://github.com/gavar/wrench/commit/60a102c))
* ask before switching to publish step ([74e6351](https://github.com/gavar/wrench/commit/74e6351))
* check if workspace pointing outside the working directory ([6168297](https://github.com/gavar/wrench/commit/6168297))
* createWorkspaceLogger ([3b606cb](https://github.com/gavar/wrench/commit/3b606cb))
* feat: `@wrench/semantic-release-ws` initial version ([453ca92](https://github.com/gavar/wrench/commit/453ca92))
* more common options ([9ab54bd](https://github.com/gavar/wrench/commit/9ab54bd))
* option to control interaction with GIT ([99b250f](https://github.com/gavar/wrench/commit/99b250f))
* push workspaces to remote on successful publish ([c374d1c](https://github.com/gavar/wrench/commit/c374d1c))
* rewrite `verify-release` step to avoid referencing context ([9e45d76](https://github.com/gavar/wrench/commit/9e45d76))
* rewrite analyze-commits step to avoid referencing context ([fa2f57f](https://github.com/gavar/wrench/commit/fa2f57f))
* verify next release version is greater than last one ([b42fbe8](https://github.com/gavar/wrench/commit/b42fbe8))
* workspace step execution hook ([e22e29c](https://github.com/gavar/wrench/commit/e22e29c))
