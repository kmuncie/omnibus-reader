# Omnibus Reader

An online Bible reading application

## Live Development Build

[Omnibus on Github Pages](http://kmuncie.github.io/omnibus-reader/)

## Development

Project generated using [Yeoman](http://yeoman.io/index.html) and [generator-zf5](https://github.com/juliancwirko/generator-zf5)

#### Features
* Sass compiling
* Publishing to dist directory
* Server with LiveReload (127.0.0.1:9000)
* JSHint
* Font Awesome
* [Jetzt (speed reading)](https://github.com/ds300/jetzt)

#### Jetzt Speed Reading Usage

Control is currently keyboard-only.

- Initiate jetzt by selecting some text and pressing `alt+r`.

- Change size with `+`/`-`.

- Go faster/slower with up/down arrow keys.

- Go back/forward a sentence with left/right arrow keys (hold `alt` to navigate by paragraphs).

- Pause with space.

- Close with escape.

#### Grunt tasks:

..for validating javascript
```
$ grunt validate-js
```
..for compiling files
```
$ grunt build
```
..for watching (Sass, Server on 127.0.0.1:9000 with LiveReload)
```
$ grunt
```
..for publishing project (dist directory)
```
$ grunt publish
```
..for dist directory preview (server on 127.0.0.1:9001)
```
$ grunt server-dist
```

### Created by
* Kevin Muncie
* Joshua Steelman
* Ruben Luna
* Jonathan James
* Evan Yu
* Craig Weber
