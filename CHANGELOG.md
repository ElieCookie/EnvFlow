## [2.1.4](https://gitlab.com/lenv/cli/compare/v2.1.3...v2.1.4) (2021-10-03)


### Bug Fixes

* pack dependencies into single file to prevent unexpected versions ([723e8df](https://gitlab.com/lenv/cli/commit/723e8dfb684a9420a12fd04b4d3f83a60557e90e))

## [2.1.3](https://gitlab.com/lenv/cli/compare/v2.1.2...v2.1.3) (2021-10-03)


### Bug Fixes

* specify version for cli-spinners due to bug with defaults in 2.6.1 ([29e52f3](https://gitlab.com/lenv/cli/commit/29e52f3c267e7ebf11a064859def0c574d6e6ccd))

## [2.1.2](https://gitlab.com/lenv/cli/compare/v2.1.1...v2.1.2) (2021-09-28)


### Bug Fixes

* yaml errors ([b7462a4](https://gitlab.com/lenv/cli/commit/b7462a459b3147cb7563633211719acfdab20b56))

## [2.1.1](https://gitlab.com/lenv/cli/compare/v2.1.0...v2.1.1) (2021-09-28)


### Bug Fixes

* variable name with dots ([0dd4f4a](https://gitlab.com/lenv/cli/commit/0dd4f4a1f198be60531316723227fe99ce0fd937))

# [2.1.0](https://gitlab.com/lenv/cli/compare/v2.0.0...v2.1.0) (2021-09-28)


### Bug Fixes

* unhandled promise rejection in jobs ([3eddd62](https://gitlab.com/lenv/cli/commit/3eddd62b2dc105368c6880e31b2f201504484908))


### Features

* allow to call jobs from module as object ([7289401](https://gitlab.com/lenv/cli/commit/72894011c83f0a91f793ac48f5eed714c65b4e60))

# [2.0.0](https://gitlab.com/lenv/cli/compare/v1.0.0...v2.0.0) (2021-09-28)


### Features

* add custom functions support ([4482b99](https://gitlab.com/lenv/cli/commit/4482b99707f835ab269fe4f9503233cfbece7577))


### BREAKING CHANGES

* custom functions are moved from lenv.config.js to separate files functions/**/*.function.js

# [1.0.0](https://gitlab.com/lenv/cli/compare/v0.8.1...v1.0.0) (2021-09-17)


### Bug Fixes

* log stderr ([2c05e0a](https://gitlab.com/lenv/cli/commit/2c05e0ae76c01b668fe0bb3aed1bfd86396b626c))


### feature

* string interpolation ([84f9fb6](https://gitlab.com/lenv/cli/commit/84f9fb60c7e7b254edf7b6a8958ac0971af31972))


### BREAKING CHANGES

* it may be required to escape $ and slash symbols in the existing configurations

## [0.8.1](https://gitlab.com/lenv/cli/compare/v0.8.0...v0.8.1) (2021-09-11)


### Bug Fixes

* update docs ([507a871](https://gitlab.com/lenv/cli/commit/507a871fe902fc75a15dff9a96d84458e3e35fa0))

# [0.8.0](https://gitlab.com/lenv/cli/compare/v0.7.0...v0.8.0) (2021-08-26)


### Bug Fixes

* correct job names and running docker command ([3e35903](https://gitlab.com/lenv/cli/commit/3e3590398822a31d72a41b78a80559632eb207e7))
* dynamic params on push to another screen ([7d7d230](https://gitlab.com/lenv/cli/commit/7d7d23072f4701170f8ad6bb0ff880c573741e80))
* dynamic state check ([60a0d18](https://gitlab.com/lenv/cli/commit/60a0d1880d252846f4adf0f0cb7a718a0b72aacb))
* layout break ([2c06965](https://gitlab.com/lenv/cli/commit/2c06965bf9756dec93b1d953dea68bd849787359))
* live run-docker output instead of one chunk ([25d33a8](https://gitlab.com/lenv/cli/commit/25d33a862b34499908b45a7e8d34e114f4a5c7a6))
* show label and current value ([7dc8322](https://gitlab.com/lenv/cli/commit/7dc83222f8b86f8332ac4368651038840cdaccc0))


### Features

* Added run docker job ([a3436f5](https://gitlab.com/lenv/cli/commit/a3436f5193fdceb8ddc7607a799ce3e33ee525a9))
* context menu added ([c764407](https://gitlab.com/lenv/cli/commit/c76440719f0b9fe5012fd8e27216250f1eec5b8b))
* delete artifacts added ([1a906e3](https://gitlab.com/lenv/cli/commit/1a906e38a461a365f9c75fccb19c3d3a9998a53e))
* new artifacts screen ([7261fbc](https://gitlab.com/lenv/cli/commit/7261fbcfbc28e58a9c466b6015422e61193b1e7a))
* Update artifact added ([76c2aca](https://gitlab.com/lenv/cli/commit/76c2acab227d7f764411da2a5883c2c20961a2ec))
* view artifacts ([de92d1b](https://gitlab.com/lenv/cli/commit/de92d1bc375d7a4211ff794e797bb0e18eb992be))

# [0.7.0](https://gitlab.com/lenv/cli/compare/v0.6.1...v0.7.0) (2021-08-15)


### Features

* scrolling for jobs ([005df75](https://gitlab.com/lenv/cli/commit/005df75d9c474a2b0c3b9249f18ba9bbd5f04652))

## [0.6.1](https://gitlab.com/lenv/cli/compare/v0.6.0...v0.6.1) (2021-08-08)


### Bug Fixes

* fix crash on run tab without config ([b495821](https://gitlab.com/lenv/cli/commit/b49582109fd8b7f37a95fa68e033b2e7ad6f5043))

# [0.6.0](https://gitlab.com/lenv/cli/compare/v0.5.1...v0.6.0) (2021-08-08)


### Features

* Add jobs and custom functions ([eec5bf4](https://gitlab.com/lenv/cli/commit/eec5bf436b8c3e07f6a3082ebca98c2ee083abca))
* modules hot reloading ([88c2ec0](https://gitlab.com/lenv/cli/commit/88c2ec027f81d63a3ef564f95b93779007f5a87b))

## [0.5.1](https://gitlab.com/lenv/cli/compare/v0.5.0...v0.5.1) (2021-06-22)


### Bug Fixes

* Use default config if config from the state doesn't exist ([a1e5368](https://gitlab.com/lenv/cli/commit/a1e53688b114de8832ab1f4737ce99dfd3b95cb2))

# [0.5.0](https://gitlab.com/lenv/cli/compare/v0.4.3...v0.5.0) (2021-06-19)


### Features

* remove modules description from home screen ([da297c7](https://gitlab.com/lenv/cli/commit/da297c71a2c8c9a940de8c4b313f5429d4a086e3))
* show version on home screen ([12a3e84](https://gitlab.com/lenv/cli/commit/12a3e84fceeda828b5ff270fe229884e7e90026f))

## [0.4.3](https://gitlab.com/lenv/cli/compare/v0.4.2...v0.4.3) (2021-06-19)


### Bug Fixes

* add bump version to CI ([e814e3d](https://gitlab.com/lenv/cli/commit/e814e3ddc6221eed6d53bac783b823aaf0c7f9de))

## [0.4.2](https://gitlab.com/lenv/cli/compare/v0.4.1...v0.4.2) (2021-06-19)


### Bug Fixes

* fix ci ([33ac780](https://gitlab.com/lenv/cli/commit/33ac7808e8ec516ef60646cf7eee054d51682eeb))

## [0.4.1](https://gitlab.com/lenv/cli/compare/v0.4.0...v0.4.1) (2021-06-19)


### Bug Fixes

* fix ci ([60606ff](https://gitlab.com/lenv/cli/commit/60606ffca1dd6ef0c6fd058a0f30516a39a87497))

# [0.4.0](https://gitlab.com/lenv/cli/compare/v0.3.0...v0.4.0) (2021-06-19)


### Features

* add changelog ([2b4affe](https://gitlab.com/lenv/cli/commit/2b4affeab9dbb4dfe5383e62a993ff1624b8a37e))
