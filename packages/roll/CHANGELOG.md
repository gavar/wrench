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
