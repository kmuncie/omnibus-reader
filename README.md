# Omnibus Reader

An online Bible reading application

## Development

Project  originally generated using [Yeoman](http://yeoman.io/index.html) and [generator-zf5](https://github.com/juliancwirko/generator-zf5). Modified from those origins. 

#### Features
* LibSass compiling
* Development build to dev directory
* Publishing build to dist directory
* Server with LiveReload (127.0.0.1:9000)
* JSHint
* Font Awesome
* [Jetzt (speed reading)](https://github.com/ds300/jetzt)

#### Jetzt Speed Reading Usage

Control is currently keyboard-only.

- Initiate jetzt by pressing `alt`-`s` and clicking on the block of text you wish to read. Alternatively, select some text before pressing `alt`-`s`.

- Change size with `+`/`-`.

- Go faster/slower with up/down arrow keys.

- Go back/forward a sentence with left/right arrow keys (hold `alt` to navigate by paragraphs).

- Pause with space.

- Close with escape.

- Switch between light/dark themes with `0`

- Toggle summary stats with `/` or `?` at the end of a run

#### Grunt tasks:

..for validating javascript
```
$ grunt validate-js
```
..for compiling files
```
$ grunt build
```
..for development with watching (Sass, copy to dev folder, Server on 127.0.0.1:9000 with LiveReload)
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

### Contributors
* Ethan Smith
* Ace Muncie
