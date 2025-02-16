<p align="center">
	<a href="https://xesf.github.io/sketchbook/"><img src="./src/img/cover-by-weiserhei.jpg"></a>
	<br>
	<a href="https://xesf.github.io/sketchbook/">Live demo</a>
	<br>
</p>

# 📒 Sketchbook by

<img src="./src/img/thumbnail.png">

Simple web based game engine built on [three.js](https://github.com/mrdoob/three.js) and [cannon-es](https://github.com/pmndrs/cannon-es) focused on third-person character controls and related gameplay mechanics.

Mostly a playground for exploring how conventional third person gameplay mechanics found in modern games work and recreating them in a general way.

## Features

* World
	* Three.js scene
	* Cannon.js physics
	* Variable timescale
	* Frame skipping
	* FXAA anti-aliasing
* Characters
	* Third-person camera
	* Raycast character controller with capsule collisions
	* General state system
	* Character AI
* Vehicles
	* Cars
	* Airplanes
	* Helicopters

All planned features can be found in the [GitHub Projects](https://github.com/xesfnet/Sketchbook/projects).

## ThreeJS Discourse
* https://discourse.threejs.org/t/sketchbook-v0-4-three-js-cannon-js-playground/18432

## Usage

You can define your own scenes in Blender, and then read them with Sketchbook. Sketchbook needs to run on a local server such as [http-server](https://www.npmjs.com/package/http-server) or [webpack-dev-server](https://github.com/webpack/webpack-dev-server) to be able to load external assets.

<!-- #### Script tag -->

1. Import:

```html
<script src="sketchbook.min.js"></script>
```

2. Load a glb scene defined in Blender:

```javascript
const world = new Sketchbook.World('scene.glb');
```

<!--

#### NPM

1. Install:

```
npm i sketchbook
```

2. Import:

```javascript
import { World } from 'sketchbook';
```

3. Load a glb scene defined in Blender:

```javascript
const world = new World('scene.glb');
```

-->

## Contributing

1. Get the LTS version of [Node.js](https://nodejs.org/en/) 16
2. [Fork this repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
3. Run `npm install`
4. Run `npm run dev`
5. Make changes and test them out at http://localhost:8080
6. Commit and [make a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork)!

## Credits

Big thank you to each of the following github users for contributing to Sketchbook:

Sketchbook v0.4 Creator:
- [Jan Bláha](https://jblaha.art)
- [swift502](https://github.com/swift502/Sketchbook)

Contributions:
- [aleqsunder](https://github.com/aleqsunder/Sketchbook)
- [barhatsor](https://github.com/barhatsor/Sketchbook)
- [danshuri](https://github.com/danshuri/Sketchbook)
- [cjmott](https://github.com/cjmott/Sketchbook)
- [Inthenew](https://github.com/Inthenew/Sketchbook)
- weiserhei - Cover Art
