# [2.2.0](https://github.com/theycantrevealus/eager-wing/compare/v2.1.0...v2.2.0) (2025-11-18)


### Features

* interaction with selected object player ([d2362cb](https://github.com/theycantrevealus/eager-wing/commit/d2362cb0feb6dd9dd9198acff54306f5ef036a2d))

# [2.1.0](https://github.com/theycantrevealus/eager-wing/compare/v2.0.0...v2.1.0) (2025-11-17)


### Bug Fixes

* missing test command on root project ([a5216c8](https://github.com/theycantrevealus/eager-wing/commit/a5216c8884ffc128ec154b2995a47f283b93084f))


### Features

* object selection indicator logic ([168fa90](https://github.com/theycantrevealus/eager-wing/commit/168fa9014a6b532d26e115fc6e919dfc124221b5))
* preparation of backend service ([a35ce99](https://github.com/theycantrevealus/eager-wing/commit/a35ce9937f20b32df1dee83e7d67885aa6c105ac))

# [2.0.0](https://github.com/theycantrevealus/eager-wing/compare/v1.3.3...v2.0.0) (2025-11-14)


* chore(monorepo)!: migration to monorepo structure ([d6336fa](https://github.com/theycantrevealus/eager-wing/commit/d6336facce154b96b70c345160332e5d8f3f8471))


### BREAKING CHANGES

* Preparation to add server and socket

## [1.3.3](https://github.com/theycantrevealus/eager-wing/compare/v1.3.2...v1.3.3) (2025-11-12)


### Bug Fixes

* chunk logic using bisect, so the slices will not jagged between tiles ([1c529e2](https://github.com/theycantrevealus/eager-wing/commit/1c529e2d335c0340c6804b95124343926c1cdf54))
* handle clean recycle of unused instances and event ([5b130ce](https://github.com/theycantrevealus/eager-wing/commit/5b130ce47fe779e03066989355a53d1dccb2165f))
* performance enhancement ([de751a2](https://github.com/theycantrevealus/eager-wing/commit/de751a29e0ff66c73f947ce7d7134fddaaecf14b))
* remove unused raycast and set it re-useable as instance on class property ([6a4754f](https://github.com/theycantrevealus/eager-wing/commit/6a4754f61544fc5dba6ebe80db10c0254ad07724))
* trigger update tile only if radius changed instead of everytime ([4c0806e](https://github.com/theycantrevealus/eager-wing/commit/4c0806ea1f583b12cf5b3bdefc88c9d10081e437))

## [1.3.2](https://github.com/theycantrevealus/eager-wing/compare/v1.3.1...v1.3.2) (2025-10-28)


### Bug Fixes

* animation between idle set smooth ([04acb9d](https://github.com/theycantrevealus/eager-wing/commit/04acb9d54798113649c14b76a1bdd233485881da))
* instantiate character object for GPU buffer share ([ae9e596](https://github.com/theycantrevealus/eager-wing/commit/ae9e596aa5f45e628834f67a86cdf4368b497307))

## [1.3.1](https://github.com/theycantrevealus/eager-wing/compare/v1.3.0...v1.3.1) (2025-10-22)


### Bug Fixes

* resource leak cause of caching bone object from assets skeleton on character init ([dd8dedc](https://github.com/theycantrevealus/eager-wing/commit/dd8dedcdc3bbf910f5a35dd2a4629e9ea420ebc8))

# [1.3.0](https://github.com/theycantrevealus/eager-wing/compare/v1.2.0...v1.3.0) (2025-10-22)


### Features

* asset manager ([03a813d](https://github.com/theycantrevealus/eager-wing/commit/03a813d02cdbeacca17aff3dc26383aa35dfff5c))
* character creation change skin tone ([13bc442](https://github.com/theycantrevealus/eager-wing/commit/13bc442b9a5d8b732b8037c802f771d9a94a8ed9))
* character initiate module ([0e33520](https://github.com/theycantrevealus/eager-wing/commit/0e335203741ff5a2893a1733383df5ee21bbc495))
* character management initiate module ([7a29d8b](https://github.com/theycantrevealus/eager-wing/commit/7a29d8ba1c7e6c9fcdda0cceb3fc000628876827))
* style for character creation panel init ([4007140](https://github.com/theycantrevealus/eager-wing/commit/400714004683f64b1f3c217effcfde35e78e573d))

# [1.2.0](https://github.com/theycantrevealus/eager-wing/compare/v1.1.0...v1.2.0) (2025-10-19)


### Features

* page control ([9260220](https://github.com/theycantrevealus/eager-wing/commit/926022088ec1d6faea9808787fdee20644a25321))
* split render for character creation ([0d04183](https://github.com/theycantrevealus/eager-wing/commit/0d0418383339348a288f3bb9ab37e02af1bc60aa))

# [1.1.0](https://github.com/theycantrevealus/eager-wing/compare/v1.0.1...v1.1.0) (2025-10-19)


### Features

* add female body part customization [forearm, shoulder, thigh, upper_arm, pelvis, breast] ([6b68f17](https://github.com/theycantrevealus/eager-wing/commit/6b68f1791c7cfce0d09bb9f3c0450e7ce5a86245))

## [1.0.1](https://github.com/theycantrevealus/eager-wing/compare/v1.0.0...v1.0.1) (2025-10-18)


### Bug Fixes

* manage shared model to enhance resource management ([62b05c3](https://github.com/theycantrevealus/eager-wing/commit/62b05c321fbf3532a6828bb43c03662dd7cf6eee))

# 1.0.0 (2025-10-15)


### Bug Fixes

* vitejs/plugin-vue upgrade for vite ([1252d47](https://github.com/theycantrevealus/eager-wing/commit/1252d47c9ae9a771391e871573e76cddc2f95d12))
