# Changelog

## [2.0.0](https://github.com/freakyfelt/yet-another-json-rpc/compare/v1.0.0...v2.0.0) (2025-06-21)


### ⚠ BREAKING CHANGES

* (deps) increase minimum supported version to Node v20.17.0 ([#572](https://github.com/freakyfelt/yet-another-json-rpc/issues/572))

### Bug Fixes

* (deps) increase minimum supported version to Node v20.17.0 ([#572](https://github.com/freakyfelt/yet-another-json-rpc/issues/572)) ([bba1c7c](https://github.com/freakyfelt/yet-another-json-rpc/commit/bba1c7c4bab85854a7d2aa5f65f2f2305f2ed138))
* **deps:** bump pino from 9.5.0 to 9.6.0 ([#497](https://github.com/freakyfelt/yet-another-json-rpc/issues/497)) ([75b3fd3](https://github.com/freakyfelt/yet-another-json-rpc/commit/75b3fd331c6d56d110d69b640cc5988f6780ec05))
* **deps:** bump pino from 9.6.0 to 9.7.0 ([#560](https://github.com/freakyfelt/yet-another-json-rpc/issues/560)) ([2a206e1](https://github.com/freakyfelt/yet-another-json-rpc/commit/2a206e1ebcebeeda11679a2b11ac09c45712fa7d))
* **deps:** bump yaml from 2.6.0 to 2.6.1 ([#480](https://github.com/freakyfelt/yet-another-json-rpc/issues/480)) ([e643b7c](https://github.com/freakyfelt/yet-another-json-rpc/commit/e643b7c3d8306062db1556ca64efdf6131ecaeaa))
* **deps:** bump yaml from 2.6.1 to 2.7.0 ([#502](https://github.com/freakyfelt/yet-another-json-rpc/issues/502)) ([11228a6](https://github.com/freakyfelt/yet-another-json-rpc/commit/11228a6e2168a69ad0ba50dccdd322b2624ccb52))
* **deps:** bump yaml from 2.7.0 to 2.7.1 ([#538](https://github.com/freakyfelt/yet-another-json-rpc/issues/538)) ([8617246](https://github.com/freakyfelt/yet-another-json-rpc/commit/8617246fb271071ca4845f410fc95248ea89e38d))
* **deps:** bump yaml from 2.7.1 to 2.8.0 ([#557](https://github.com/freakyfelt/yet-another-json-rpc/issues/557)) ([cf34a95](https://github.com/freakyfelt/yet-another-json-rpc/commit/cf34a950ac47dfe512dcb056e6c4602bebdf267b))

## 1.0.0 (2024-02-24)


### ⚠ BREAKING CHANGES

* simplify down to an OAS 3.1 extension

### Features

* **cli:** add ability to read/write stdin/stdout ([43f7d5f](https://github.com/freakyfelt/yet-another-json-rpc/commit/43f7d5f1576a6371a348edafcf2b9164f7352fdd))
* **cli:** add basic addQuery and addMutation operations ([1070f3b](https://github.com/freakyfelt/yet-another-json-rpc/commit/1070f3bed917cf7c2b790e7805f11d4b56ab80ca))
* **cli:** add basic transform CLI ([0680b43](https://github.com/freakyfelt/yet-another-json-rpc/commit/0680b438fb988875ec6539682c4499d227fc6f54))
* **cli:** add DocumentTransformer; swap types package ([15d420e](https://github.com/freakyfelt/yet-another-json-rpc/commit/15d420ef6264bcaa294467c5917c834a072a5c94))
* **cli:** allow for mutation inputs in non-body locations ([abb569e](https://github.com/freakyfelt/yet-another-json-rpc/commit/abb569eb4deedddb14579b0f3b90ab685e92481f))
* **cli:** allow for overriding the path and method ([b80759b](https://github.com/freakyfelt/yet-another-json-rpc/commit/b80759b1cee6feb2e271b127eb9bd2160f2c5fb9))
* **cli:** allow for overriding the status code and description ([9b26c16](https://github.com/freakyfelt/yet-another-json-rpc/commit/9b26c1673bb8600499b45152ec759bce12e0f0a9))
* **cli:** Allow for parameter fields to be overridden ([ce96d4c](https://github.com/freakyfelt/yet-another-json-rpc/commit/ce96d4c7e4220e3a12228896d041dde56bc60d23))
* **cli:** shallow merge OAS paths ([39696b1](https://github.com/freakyfelt/yet-another-json-rpc/commit/39696b1314ca25833ac2dbc1cc3b7a23591c41ab))


### Bug Fixes

* **cli:** allow for not specifying query or mutation operations ([2d05435](https://github.com/freakyfelt/yet-another-json-rpc/commit/2d05435e6de23752cf4e929d844feeaa24be35d9))
* **cli:** deep merge provided OpenAPI paths ([43fc1e2](https://github.com/freakyfelt/yet-another-json-rpc/commit/43fc1e262e8fd3fa2b18a5e15a573cebecdc7923))
* **cli:** drop redundant package-lock.json ([980ca8a](https://github.com/freakyfelt/yet-another-json-rpc/commit/980ca8ab5a0554bfd48d03e6e7107a9538904af6))
* **cli:** execute all tests; fix broken tests ([1cea5e5](https://github.com/freakyfelt/yet-another-json-rpc/commit/1cea5e537003d27bc2bc4c3a571cc07282b2f425))
* **workspace:** move package dependencies to package ([9a9dfc8](https://github.com/freakyfelt/yet-another-json-rpc/commit/9a9dfc82d8c692832f3a13cfd2f09b715aad255e))


### Code Refactoring

* simplify down to an OAS 3.1 extension ([aef9afc](https://github.com/freakyfelt/yet-another-json-rpc/commit/aef9afc88f9b26c84447cafb88132e554a4681c3))

## [1.0.1](https://github.com/freakyfelt/yet-another-json-rpc/compare/cli-v1.0.0...cli@v1.0.1) (2023-07-03)


### Bug Fixes

* **cli:** drop redundant package-lock.json ([980ca8a](https://github.com/freakyfelt/yet-another-json-rpc/commit/980ca8ab5a0554bfd48d03e6e7107a9538904af6))

## 1.0.0 (2023-06-19)


### Features

* **cli:** add ability to read/write stdin/stdout ([43f7d5f](https://github.com/freakyfelt/yet-another-json-rpc/commit/43f7d5f1576a6371a348edafcf2b9164f7352fdd))
* **cli:** add basic addQuery and addMutation operations ([1070f3b](https://github.com/freakyfelt/yet-another-json-rpc/commit/1070f3bed917cf7c2b790e7805f11d4b56ab80ca))
* **cli:** add basic transform CLI ([0680b43](https://github.com/freakyfelt/yet-another-json-rpc/commit/0680b438fb988875ec6539682c4499d227fc6f54))
* **cli:** add DocumentTransformer; swap types package ([15d420e](https://github.com/freakyfelt/yet-another-json-rpc/commit/15d420ef6264bcaa294467c5917c834a072a5c94))
* **cli:** allow for mutation inputs in non-body locations ([abb569e](https://github.com/freakyfelt/yet-another-json-rpc/commit/abb569eb4deedddb14579b0f3b90ab685e92481f))
* **cli:** allow for overriding the path and method ([b80759b](https://github.com/freakyfelt/yet-another-json-rpc/commit/b80759b1cee6feb2e271b127eb9bd2160f2c5fb9))
* **cli:** allow for overriding the status code and description ([9b26c16](https://github.com/freakyfelt/yet-another-json-rpc/commit/9b26c1673bb8600499b45152ec759bce12e0f0a9))
* **cli:** Allow for parameter fields to be overridden ([ce96d4c](https://github.com/freakyfelt/yet-another-json-rpc/commit/ce96d4c7e4220e3a12228896d041dde56bc60d23))
* **cli:** shallow merge OAS paths ([39696b1](https://github.com/freakyfelt/yet-another-json-rpc/commit/39696b1314ca25833ac2dbc1cc3b7a23591c41ab))


### Bug Fixes

* **cli:** allow for not specifying query or mutation operations ([2d05435](https://github.com/freakyfelt/yet-another-json-rpc/commit/2d05435e6de23752cf4e929d844feeaa24be35d9))
* **cli:** deep merge provided OpenAPI paths ([43fc1e2](https://github.com/freakyfelt/yet-another-json-rpc/commit/43fc1e262e8fd3fa2b18a5e15a573cebecdc7923))
* **cli:** execute all tests; fix broken tests ([1cea5e5](https://github.com/freakyfelt/yet-another-json-rpc/commit/1cea5e537003d27bc2bc4c3a571cc07282b2f425))
* **workspace:** move package dependencies to package ([9a9dfc8](https://github.com/freakyfelt/yet-another-json-rpc/commit/9a9dfc82d8c692832f3a13cfd2f09b715aad255e))

## 1.0.0 (2023-06-19)


### Features

* **cli:** add ability to read/write stdin/stdout ([43f7d5f](https://github.com/freakyfelt/yet-another-json-rpc/commit/43f7d5f1576a6371a348edafcf2b9164f7352fdd))
* **cli:** add basic addQuery and addMutation operations ([1070f3b](https://github.com/freakyfelt/yet-another-json-rpc/commit/1070f3bed917cf7c2b790e7805f11d4b56ab80ca))
* **cli:** add basic transform CLI ([0680b43](https://github.com/freakyfelt/yet-another-json-rpc/commit/0680b438fb988875ec6539682c4499d227fc6f54))
* **cli:** add DocumentTransformer; swap types package ([15d420e](https://github.com/freakyfelt/yet-another-json-rpc/commit/15d420ef6264bcaa294467c5917c834a072a5c94))
* **cli:** allow for mutation inputs in non-body locations ([abb569e](https://github.com/freakyfelt/yet-another-json-rpc/commit/abb569eb4deedddb14579b0f3b90ab685e92481f))
* **cli:** allow for overriding the path and method ([b80759b](https://github.com/freakyfelt/yet-another-json-rpc/commit/b80759b1cee6feb2e271b127eb9bd2160f2c5fb9))
* **cli:** allow for overriding the status code and description ([9b26c16](https://github.com/freakyfelt/yet-another-json-rpc/commit/9b26c1673bb8600499b45152ec759bce12e0f0a9))
* **cli:** Allow for parameter fields to be overridden ([ce96d4c](https://github.com/freakyfelt/yet-another-json-rpc/commit/ce96d4c7e4220e3a12228896d041dde56bc60d23))
* **cli:** shallow merge OAS paths ([39696b1](https://github.com/freakyfelt/yet-another-json-rpc/commit/39696b1314ca25833ac2dbc1cc3b7a23591c41ab))


### Bug Fixes

* **cli:** allow for not specifying query or mutation operations ([2d05435](https://github.com/freakyfelt/yet-another-json-rpc/commit/2d05435e6de23752cf4e929d844feeaa24be35d9))
* **cli:** deep merge provided OpenAPI paths ([43fc1e2](https://github.com/freakyfelt/yet-another-json-rpc/commit/43fc1e262e8fd3fa2b18a5e15a573cebecdc7923))
* **cli:** execute all tests; fix broken tests ([1cea5e5](https://github.com/freakyfelt/yet-another-json-rpc/commit/1cea5e537003d27bc2bc4c3a571cc07282b2f425))
* **workspace:** move package dependencies to package ([9a9dfc8](https://github.com/freakyfelt/yet-another-json-rpc/commit/9a9dfc82d8c692832f3a13cfd2f09b715aad255e))

## 1.0.0 (2023-06-19)


### Features

* **cli:** add ability to read/write stdin/stdout ([43f7d5f](https://github.com/freakyfelt/yet-another-json-rpc/commit/43f7d5f1576a6371a348edafcf2b9164f7352fdd))
* **cli:** add basic addQuery and addMutation operations ([1070f3b](https://github.com/freakyfelt/yet-another-json-rpc/commit/1070f3bed917cf7c2b790e7805f11d4b56ab80ca))
* **cli:** add basic transform CLI ([0680b43](https://github.com/freakyfelt/yet-another-json-rpc/commit/0680b438fb988875ec6539682c4499d227fc6f54))
* **cli:** add DocumentTransformer; swap types package ([15d420e](https://github.com/freakyfelt/yet-another-json-rpc/commit/15d420ef6264bcaa294467c5917c834a072a5c94))
* **cli:** allow for mutation inputs in non-body locations ([abb569e](https://github.com/freakyfelt/yet-another-json-rpc/commit/abb569eb4deedddb14579b0f3b90ab685e92481f))
* **cli:** allow for overriding the path and method ([b80759b](https://github.com/freakyfelt/yet-another-json-rpc/commit/b80759b1cee6feb2e271b127eb9bd2160f2c5fb9))
* **cli:** allow for overriding the status code and description ([9b26c16](https://github.com/freakyfelt/yet-another-json-rpc/commit/9b26c1673bb8600499b45152ec759bce12e0f0a9))
* **cli:** Allow for parameter fields to be overridden ([ce96d4c](https://github.com/freakyfelt/yet-another-json-rpc/commit/ce96d4c7e4220e3a12228896d041dde56bc60d23))
* **cli:** shallow merge OAS paths ([39696b1](https://github.com/freakyfelt/yet-another-json-rpc/commit/39696b1314ca25833ac2dbc1cc3b7a23591c41ab))


### Bug Fixes

* **cli:** allow for not specifying query or mutation operations ([2d05435](https://github.com/freakyfelt/yet-another-json-rpc/commit/2d05435e6de23752cf4e929d844feeaa24be35d9))
* **cli:** deep merge provided OpenAPI paths ([43fc1e2](https://github.com/freakyfelt/yet-another-json-rpc/commit/43fc1e262e8fd3fa2b18a5e15a573cebecdc7923))
* **cli:** execute all tests; fix broken tests ([1cea5e5](https://github.com/freakyfelt/yet-another-json-rpc/commit/1cea5e537003d27bc2bc4c3a571cc07282b2f425))
* **workspace:** move package dependencies to package ([9a9dfc8](https://github.com/freakyfelt/yet-another-json-rpc/commit/9a9dfc82d8c692832f3a13cfd2f09b715aad255e))
