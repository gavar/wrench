## [0.0.5](https://github.com/gavar/wrench/compare/v/semantic-release/0.0.4...v/semantic-release/0.0.5) (2019-09-06)


### Features

* exec utils ([d9014e5](https://github.com/gavar/wrench/commit/d9014e5))
* tag parsing utils ([ea2d6b4](https://github.com/gavar/wrench/commit/ea2d6b4))

## [0.0.4](https://github.com/gavar/wrench/compare/v/semantic-release/0.0.3...v/semantic-release/0.0.4) (2019-09-01)


### Bug Fixes

* use release version of `[@emulsy](https://github.com/emulsy)` ([688af88](https://github.com/gavar/wrench/commit/688af88))

## [0.0.3](https://github.com/gavar/wrench/compare/v/semantic-release/0.0.2...v/semantic-release/0.0.3) (2019-08-31)


### Features

* track hotfix files since there might be several semantic-release libs per project ([ee14587](https://github.com/gavar/wrench/commit/ee14587))



## [0.0.2](https://github.com/gavar/wrench/compare/v/semantic-release/0.0.1...v/semantic-release/0.0.2) (2019-08-31)


### Bug Fixes

* `forceRelease` option type definition ([84f137f](https://github.com/gavar/wrench/commit/84f137f))
* last / next release resolution ([f1885fe](https://github.com/gavar/wrench/commit/f1885fe))
* split semver / release utils ([1606d1e](https://github.com/gavar/wrench/commit/1606d1e))


### Features

* expose plugin definitions ([df1778c](https://github.com/gavar/wrench/commit/df1778c))
* introduce `LastRelease` type ([a82085b](https://github.com/gavar/wrench/commit/a82085b))
* introduce `version` and `pack` hooks as part of `prepare` ([778e0ae](https://github.com/gavar/wrench/commit/778e0ae))
* more git utils ([f30b6db](https://github.com/gavar/wrench/commit/f30b6db))



## 0.0.1 (2019-08-31)


### Bug Fixes

* avoid passing passing this to array function as it may not work for some reason ([adcc3c4](https://github.com/gavar/wrench/commit/adcc3c4))
* import paths ([aac0cb1](https://github.com/gavar/wrench/commit/aac0cb1))
* last release resolution ([fe1c1c7](https://github.com/gavar/wrench/commit/fe1c1c7))
* move own commits resolution to `semantic-release` package ([b7095be](https://github.com/gavar/wrench/commit/b7095be))


### Features

* `@wrench/semantic-release` initial version ([27fd270](https://github.com/gavar/wrench/commit/27fd270))
* addChannel step ([9f5a47b](https://github.com/gavar/wrench/commit/9f5a47b))
* allow to explicitly define next release version ([091d139](https://github.com/gavar/wrench/commit/091d139))
* expose more GIT methods ([a473c9b](https://github.com/gavar/wrench/commit/a473c9b))
* expose some internal methods of semantic-release ([0e9ae8a](https://github.com/gavar/wrench/commit/0e9ae8a))
* hotfix to allow returning release array from publish hook ([2204cc5](https://github.com/gavar/wrench/commit/2204cc5))
* push workspaces to remote on successful publish ([c374d1c](https://github.com/gavar/wrench/commit/c374d1c))
* register hotfixes from cwd path to support symlinks ([fba8d7e](https://github.com/gavar/wrench/commit/fba8d7e))
