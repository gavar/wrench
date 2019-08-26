# [2.0.0-beta.3](https://github.com/gavar/wrench/compare/v/roll/2.0.0-beta.2@beta...v/roll/2.0.0-beta.3@beta) (2019-08-26)


### Bug Fixes

* import paths ([e54e108](https://github.com/gavar/wrench/commit/e54e108))

# [2.0.0-beta.2](https://github.com/gavar/wrench/compare/v/roll/2.0.0-beta.1...v/roll/2.0.0-beta.2@beta) (2019-08-24)


### Bug Fixes

* allow bin to reference own files by package name ([a345083](https://github.com/gavar/wrench/commit/a345083))
* bin output path in `lib` mode ([91a33cb](https://github.com/gavar/wrench/commit/91a33cb))
* do not inject executable header into bin ([cbde25e](https://github.com/gavar/wrench/commit/cbde25e))
* format imports ([ddefdce](https://github.com/gavar/wrench/commit/ddefdce))


### Features

* allow to `roll` bin as library ([120f063](https://github.com/gavar/wrench/commit/120f063))
* check for esnext field to find typescript sources ([23f2b02](https://github.com/gavar/wrench/commit/23f2b02))
* no need in complex external check for bin ([f1a37e7](https://github.com/gavar/wrench/commit/f1a37e7))
* run `roll` through `@wrench/executable` ([1e42817](https://github.com/gavar/wrench/commit/1e42817))

# [2.0.0-beta.2](https://github.com/gavar/wrench/compare/v/roll/2.0.0-beta.1...v/roll/2.0.0-beta.2@beta) (2019-08-24)


### Bug Fixes

* allow bin to reference own files by package name ([a345083](https://github.com/gavar/wrench/commit/a345083))
* bin output path in `lib` mode ([91a33cb](https://github.com/gavar/wrench/commit/91a33cb))
* do not inject executable header into bin ([cbde25e](https://github.com/gavar/wrench/commit/cbde25e))
* format imports ([ddefdce](https://github.com/gavar/wrench/commit/ddefdce))


### Features

* allow to `roll` bin as library ([120f063](https://github.com/gavar/wrench/commit/120f063))
* check for esnext field to find typescript sources ([23f2b02](https://github.com/gavar/wrench/commit/23f2b02))
* no need in complex external check for bin ([f1a37e7](https://github.com/gavar/wrench/commit/f1a37e7))
* run `roll` through `@wrench/executable` ([1e42817](https://github.com/gavar/wrench/commit/1e42817))

# [2.0.0-beta.2](https://github.com/gavar/wrench/compare/v/roll/2.0.0-beta.1...v/roll/2.0.0-beta.2@beta) (2019-08-24)


### Bug Fixes

* allow bin to reference own files by package name ([a345083](https://github.com/gavar/wrench/commit/a345083))
* bin output path in `lib` mode ([91a33cb](https://github.com/gavar/wrench/commit/91a33cb))
* do not inject executable header into bin ([cbde25e](https://github.com/gavar/wrench/commit/cbde25e))
* format imports ([ddefdce](https://github.com/gavar/wrench/commit/ddefdce))


### Features

* allow to `roll` bin as library ([120f063](https://github.com/gavar/wrench/commit/120f063))
* check for esnext field to find typescript sources ([23f2b02](https://github.com/gavar/wrench/commit/23f2b02))
* no need in complex external check for bin ([f1a37e7](https://github.com/gavar/wrench/commit/f1a37e7))
* run `roll` through `@wrench/executable` ([1e42817](https://github.com/gavar/wrench/commit/1e42817))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 2.0.0-beta.1 (2019-08-09)


### Bug Fixes

* avoid using `this` while checking dirs ([0061e6b](https://github.com/gavar/wrench/commit/0061e6b))
* better parsing of package.json ([4c12b42](https://github.com/gavar/wrench/commit/4c12b42))
* clenup nodejs imports ([03158df](https://github.com/gavar/wrench/commit/03158df))
* do not inline source when 'bin' imports lib itself ([d7370aa](https://github.com/gavar/wrench/commit/d7370aa))
* dts-pretty detect closing block ([44b93fc](https://github.com/gavar/wrench/commit/44b93fc))
* dts-pretty formatting by typescript service ([07994f6](https://github.com/gavar/wrench/commit/07994f6))
* dts-pretty improvements ([75e0d06](https://github.com/gavar/wrench/commit/75e0d06))
* export plugins ([7475599](https://github.com/gavar/wrench/commit/7475599))
* function binding ([c29be55](https://github.com/gavar/wrench/commit/c29be55))
* move merge to util ([bfcb4ca](https://github.com/gavar/wrench/commit/bfcb4ca))
* override declarationDir only if required ([a6fb1c7](https://github.com/gavar/wrench/commit/a6fb1c7))
* trim last `export {};` from dts-bundle-generator ([d29e57d](https://github.com/gavar/wrench/commit/d29e57d))
* tstt package version ([43fb8c1](https://github.com/gavar/wrench/commit/43fb8c1))
* use dts-pretty along with dts ([8a21296](https://github.com/gavar/wrench/commit/8a21296))


### Features

* `@wrench/roll` ([99fce15](https://github.com/gavar/wrench/commit/99fce15))
* dts-bundle-generator plugin ([30c938b](https://github.com/gavar/wrench/commit/30c938b))
* dts-pretty plugin ([d4797eb](https://github.com/gavar/wrench/commit/d4797eb))
* fully refactoring `roll` package using custom typescript plugin ([01e08f5](https://github.com/gavar/wrench/commit/01e08f5))
* more utils ([92a1541](https://github.com/gavar/wrench/commit/92a1541))
* wrap rollup-cleanup plugin to support render chunk hook ([b608c85](https://github.com/gavar/wrench/commit/b608c85))
* **roll:** configure copycat ([7079d7e](https://github.com/gavar/wrench/commit/7079d7e))
* inject `source-map-support` installation into executables ([7c90717](https://github.com/gavar/wrench/commit/7c90717))
