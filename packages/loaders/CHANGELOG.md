## [0.0.6](https://github.com/gavar/wrench/compare/v/loaders/0.0.5...v/loaders/0.0.6) (2019-09-06)


### Bug Fixes

* `ts-node` config ([bc32844](https://github.com/gavar/wrench/commit/bc32844))


### Features

* allow to override loader options in package.json ([a724d78](https://github.com/gavar/wrench/commit/a724d78))

## [0.0.5](https://github.com/gavar/wrench/compare/v/loaders/0.0.4...v/loaders/0.0.5) (2019-09-04)


### Bug Fixes

* `ts-node` default ignore ([c5f1ba2](https://github.com/gavar/wrench/commit/c5f1ba2))
* use `Module._resolveFilename` instead of Module.createRequire ([b6d02e7](https://github.com/gavar/wrench/commit/b6d02e7))


### Features

* checks `process.env` when creating `ts-node` options ([1b3fb47](https://github.com/gavar/wrench/commit/1b3fb47))

## [0.0.4](https://github.com/gavar/wrench/compare/v/loaders/0.0.3...v/loaders/0.0.4) (2019-09-02)


### Bug Fixes

* disable declarations for `ts-node` ([8ab127b](https://github.com/gavar/wrench/commit/8ab127b))

## [0.0.3](https://github.com/gavar/wrench/compare/v/loaders/0.0.2...v/loaders/0.0.3) (2019-08-30)


### Bug Fixes

* always emit helpers for ts-node ([23f1ea4](https://github.com/gavar/wrench/commit/23f1ea4))
* include missing package files ([0c7ac52](https://github.com/gavar/wrench/commit/0c7ac52))

## 0.0.1 (2019-08-30)


### Bug Fixes

* format imports ([ddefdce](https://github.com/gavar/wrench/commit/ddefdce))
* log messages ([4e04574](https://github.com/gavar/wrench/commit/4e04574))


### Features

* `@wrench/loaders` initial files ([acbacad](https://github.com/gavar/wrench/commit/acbacad))
* rewrite loaders to js via [@ts-check](https://github.com/ts-check) to avoid compilation ([4952a18](https://github.com/gavar/wrench/commit/4952a18))
