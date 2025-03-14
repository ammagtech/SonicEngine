# SonicEngine IDE

This is the SonicEngine editor. It is based on [React](https://facebook.github.io/react/), [Material-UI](http://www.material-ui.com), [Pixi.js](https://github.com/pixijs/pixi.js), [Three.js](https://github.com/mrdoob/three.js) and [Electron](https://electron.atom.io/) for the desktop app.
It uses GDevelop [core C++ classes compiled to Javascript](https://github.com/4ian/GDevelop.js) to work with SonicEngine games.

![SonicEngine editor](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20screenshot.png "SonicEngine editor")

## 1) Installation 💻

Make sure to have [Git](https://git-scm.com/) and [Node.js](https://nodejs.org) installed. [Yarn](https://yarnpkg.com) is optional.

```bash
cd SonicEnginne/newIDE/app
npm install # or yarn
```

## 2) Development 🤓

```bash
npm start # or yarn start
```

This will open the app in your web browser.

Images resources, GDJS Runtime, extensions will be copied in resources, and libGD.js will be downloaded automatically.

### Development of UI components

You can run a [Storybook](https://github.com/storybooks/storybook) that is used as a playground for rapid UI component development and testing:

```bash
cd newIDE/app
npm run storybook # or yarn storybook
```

### Tests

Unit tests, type checking and auto-formatting of the code can be launched with these commands:

```bash
cd newIDE/app
npm run test # or yarn test
npm run flow # or yarn flow
npm run format # or yarn format
```

### Theming

It's pretty easy to create new themes. Check the [README about themes](./README-themes.md)

### Recommended tools for development

Any text editor is fine, but it's a good idea to have one with _Prettier_ (code formatting), _ESLint_ (code linting) and _Flow_ (type checking) integration. [Modern JavaScript is used for the editor](https://github.com/4ian/GDevelop/blob/master/newIDE/docs/Supported-JavaScript-features-and-coding-style.md).

👉 You can use [Visual Studio Code](https://code.visualstudio.com) with these extensions: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Flow Language Support](https://github.com/flowtype/flow-for-vscode).
