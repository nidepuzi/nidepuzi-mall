nidepuzi-mall
_______________________

[![Build Status](http://git.xiaolumm.com:8000/api/badges/ndpuz/nidepuzi-mall/status.svg)](http://git.xiaolumm.com:8000/ndpuz/nidepuzi-mall)

## Table of Contents

- [About](#about)
- [Sublime Text Setup](#about)
- [Installation](#installation)
- [Development](#development)
- [Build](#build--buildproduction)

## About
- [React](https://github.com/facebook/react)
- [Redux](https://github.com/gaearon/redux)
- [React Router](https://github.com/rackt/react-router)
- [axios](https://github.com/mzabriskie/axios)
- [Bootstrap-loader](https://github.com/shakacode/bootstrap-loader) (configurable with .bootstraprc)
- Sass modules ([sass-loader](https://github.com/jtangelder/sass-loader) [css-loader](https://github.com/webpack/css-loader) [style-loader](https://github.com/webpack/style-loader))
- [react transform](https://github.com/gaearon/react-transform)
- [redux-logger](https://github.com/fcomb/redux-logger)
- [react-document-meta](https://github.com/kodyl/react-document-meta)
- [redux-form](https://github.com/erikras/redux-form)
- [karma](https://github.com/karma-runner/karma)
- [mocha](https://github.com/mochajs/mocha)
- [react-component-errors](https://www.npmjs.com/package/react-component-errors)

## Sublime Text Setup
### 1. Install package controll [https://packagecontrol.io/installation](https://packagecontrol.io/installation)
### 2. Install Below Plugins
```
Babel
Babel Snippets
Sass
SublimeLinter
SublimeLinter-eslint
HTML-CSS-JS Prettify
``` 
### 3. Plugins Setup
```text
a. HTML-CSS-JS Prettify Setup
Preference -> Package Settings -> HTML/CSS/JS Prettify -> Set Prettify Preference
set 'indent_size' as 2,
set 'e4x' as true, 

b. SublimeLinter Setup
Tools -> SublimeLinter -> Debug Mode

c. JS Syntax Setup
View -> Syntax -> Open all with current extension as ... -> Babel -> JavaScript(Babel)
```
## Installation
```shell
$ git clone ssh://git@git.xiaolumm.com:10022/ndpuz/nidepuzi-mall.git
$ cd nidepuzi-mall
$ npm install babel-eslint -g
$ npm install eslint -g
$ npm install
```

## Development
```
$ npm start -- --env=staging // --env=production
```
Runs the project in development mode with hot-reloading of `src` folder.
Open your browser at [http://localhost:7070](http://localhost:7070).

## Clean
```
$ npm run clean
```
Using rimraf clean the `dist` folder, which is the target of the `build`

## Build & build:production
```
$ npm run build
```
Builds the app into the 'dist' folder for deployment
```
$ npm run build:production
```
## Run karma
```
$ npm test
```


## Compontent Doc
- [Carousel](/src/components/Carousel)
- [Checkbox](/src/components/Checkbox)
- [Header](/src/components/Header)
- [Switch](/src/components/Switch)

