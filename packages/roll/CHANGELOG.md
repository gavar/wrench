## [0.0.9](https://github.com/gavar/wrench/compare/v/roll/0.0.8...v/roll/0.0.9) (2020-02-13)


### Features

* support es2015 and avoid compiling same targets twice ([c9b9429](https://github.com/gavar/wrench/commit/c9b9429df6b7cf6ec689c68c1d9cde3db821d2df))

## [0.0.8](https://github.com/gavar/wrench/compare/v/roll/0.0.7...v/roll/0.0.8) (2020-02-12)


### Bug Fixes

* setting script target only if provided ([1d9433c](https://github.com/gavar/wrench/commit/1d9433c251d2defefcc5366e585faea381226f3d))


### Features

* build modular by default ([4da73b3](https://github.com/gavar/wrench/commit/4da73b3a1fb2377ac8ed0b55f671b1397d775593))
* support esm5 / fesm5 / esm2015 / fesm2015 pacakge fields defined by Angular Package Format ([794c8f1](https://github.com/gavar/wrench/commit/794c8f1f406899cd70755c2f40db2ff9da4c4ca0))

## [0.0.7](https://github.com/gavar/wrench/compare/v/roll/0.0.6...v/roll/0.0.7) (2019-10-29)

## [0.0.6](https://github.com/gavar/wrench/compare/v/roll/0.0.5...v/roll/0.0.6) (2019-10-23)


### Bug Fixes

* declaration of missing types ([9571585](https://github.com/gavar/wrench/commit/9571585))
* importing builtin modules ([410f8d6](https://github.com/gavar/wrench/commit/410f8d6))

## [0.0.5](https://github.com/gavar/wrench/compare/v/roll/0.0.4...v/roll/0.0.5) (2019-10-07)


### Bug Fixes

* better parsing of cli arguments ([b3b0fca](https://github.com/gavar/wrench/commit/b3b0fca))
* don't need lodash ([ddb87da](https://github.com/gavar/wrench/commit/ddb87da))
* resolving rollup binary location ([a6d1fef](https://github.com/gavar/wrench/commit/a6d1fef))

## [0.0.4](https://github.com/gavar/wrench/compare/v/roll/0.0.3...v/roll/0.0.4) (2019-08-31)


### Bug Fixes

* constraints for dependencies with major version less than 1 ([0a500e9](https://github.com/gavar/wrench/commit/0a500e9))

## [0.0.3](https://github.com/gavar/wrench/compare/v/roll/0.0.2...v/roll/0.0.3) (2019-08-30)


### Bug Fixes

* update dependency version ([15a780a](https://github.com/gavar/wrench/commit/15a780a))

## [0.0.2](https://github.com/gavar/wrench/compare/v/roll/0.0.1...v/roll/0.0.2) (2019-08-30)


### Bug Fixes

* update dependencies ([956658c](https://github.com/gavar/wrench/commit/956658c))



## 0.0.1 (2019-08-30)


### Bug Fixes

* allow bin to reference own files by package name ([a345083](https://github.com/gavar/wrench/commit/a345083))
* avoid using `this` while checking dirs ([0061e6b](https://github.com/gavar/wrench/commit/0061e6b))
* better parsing of package.json ([4c12b42](https://github.com/gavar/wrench/commit/4c12b42))
* bin output path in `lib` mode ([91a33cb](https://github.com/gavar/wrench/commit/91a33cb))
* clenup nodejs imports ([03158df](https://github.com/gavar/wrench/commit/03158df))
* do not inject executable header into bin ([cbde25e](https://github.com/gavar/wrench/commit/cbde25e))
* do not inline source when 'bin' imports lib itself ([d7370aa](https://github.com/gavar/wrench/commit/d7370aa))
* dts-pretty detect closing block ([44b93fc](https://github.com/gavar/wrench/commit/44b93fc))
* dts-pretty formatting by typescript service ([07994f6](https://github.com/gavar/wrench/commit/07994f6))
* dts-pretty improvements ([75e0d06](https://github.com/gavar/wrench/commit/75e0d06))
* export plugins ([7475599](https://github.com/gavar/wrench/commit/7475599))
* format imports ([ddefdce](https://github.com/gavar/wrench/commit/ddefdce))
* function binding ([c29be55](https://github.com/gavar/wrench/commit/c29be55))
* import paths ([e54e108](https://github.com/gavar/wrench/commit/e54e108))
* move merge to util ([bfcb4ca](https://github.com/gavar/wrench/commit/bfcb4ca))
* output directory when modular project main points to nested directory ([8da963b](https://github.com/gavar/wrench/commit/8da963b))
* override declarationDir only if required ([a6fb1c7](https://github.com/gavar/wrench/commit/a6fb1c7))
* trim last `export {};` from dts-bundle-generator ([d29e57d](https://github.com/gavar/wrench/commit/d29e57d))
* tstt package version ([43fb8c1](https://github.com/gavar/wrench/commit/43fb8c1))
* use dts-pretty along with dts ([8a21296](https://github.com/gavar/wrench/commit/8a21296))


### Features

* `@wrench/roll` ([99fce15](https://github.com/gavar/wrench/commit/99fce15))
* allow to `roll` bin as library ([120f063](https://github.com/gavar/wrench/commit/120f063))
* check for esnext field to find typescript sources ([23f2b02](https://github.com/gavar/wrench/commit/23f2b02))
* dts-bundle-generator plugin ([30c938b](https://github.com/gavar/wrench/commit/30c938b))
* dts-pretty plugin ([d4797eb](https://github.com/gavar/wrench/commit/d4797eb))
* fully refactoring `roll` package using custom typescript plugin ([01e08f5](https://github.com/gavar/wrench/commit/01e08f5))
* inject `source-map-support` installation into executables ([7c90717](https://github.com/gavar/wrench/commit/7c90717))
* more utils ([92a1541](https://github.com/gavar/wrench/commit/92a1541))
* no need in complex external check for bin ([f1a37e7](https://github.com/gavar/wrench/commit/f1a37e7))
* run `roll` through `@wrench/executable` ([1e42817](https://github.com/gavar/wrench/commit/1e42817))
* wrap rollup-cleanup plugin to support render chunk hook ([b608c85](https://github.com/gavar/wrench/commit/b608c85))
* **roll:** configure copycat ([7079d7e](https://github.com/gavar/wrench/commit/7079d7e))
