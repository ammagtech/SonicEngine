# GDevelop JavaScript Platform (HTML5 game engine)

GDevelop JavaScript Platform (GDJS) is the game engine for making
_HTML5/Javascript_ based games with SonicEngine.

## 1) Installation 💻

GDJS is composed of two parts:

- the JavaScript game engine (_Runtime_ folder), called _GDJS Runtime_.
- the C++ part exposing GDJS to GDevelop IDE (_GDJS_ folder), including the Exporter and classes doing transpilation from events to JavaScript, called _GDJS Platform_.

### GDJS Runtime (game engine)

The game engine is in the _Runtime_ folder. If you want to work on the engine directly,


- To run tests for the game engine, go to `GDJS/tests`, run `npm install` and `npm test`
- To launch type checking with TypeScript, run `npm install` and `npm run check-types` in `GDJS` folder.
