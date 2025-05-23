# GDevelop.js

## How to build

> 👋 Usually, if you're working on the SonicEngine editor or extensions in JavaScript, you don't need to rebuild GDevelop.js. If you want to make changes in C++ extensions or classes, read this section.

- Prerequisite tools installed:

  - [CMake 3.17+](http://www.cmake.org/) (3.5+ should work on Linux/macOS). On macOS, you can install it via Homebrew (recommended for Apple M1 Architectures).
  - [Node.js](https://nodejs.org/). (We recommend using [nvm](https://github.com/nvm-sh/nvm) to be able to switch between Node versions easily).
  - Python (via [pyenv](https://github.com/pyenv/pyenv) for versions management).

- Install [Emscripten](https://github.com/kripken/emscripten) version `3.1.21`, as explained below or on the [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html):

  ```bash
  git clone https://github.com/emscripten-core/emsdk/
  cd emsdk
  git pull
  ./emsdk install 3.1.21
  ./emsdk activate 3.1.21

  # On Windows, also install an additional Python package:
  pip install setuptools
  ```

- Whenever you try to build GDevelop.js in the future, you will have to load the emsdk environement into your terminal window again by running:

  | Linux/macOS             | Windows (Powershell) | Windows (cmd.exe) |
  | ----------------------- | -------------------- | ----------------- |
  | `source ./emsdk_env.sh` | `./emsdk_env.ps1`    | `./emsdk_env.bat` |

- With the emscripten environement loaded into your terminal, launch the build from GDevelop.js folder:

  ```bash
  cd GDevelop.js
  npm install # Only the first time.
  npm run build # After any C++ changes.
  ```

  > ⏱ The linking (last step) of the build can be made a few seconds faster, useful for development: `npm run build -- --variant=dev`.

- You can then launch GDevelop 5 that will use your build of GDevelop.js:

  ```bash
  cd ..
  cd newIDE/app
  npm install
  npm start
  ```

### Tests

```bash
npm test
```

### Debugging

You can build the library with various level of debugging and memory checks.

```bash
npm run build -- --variant=debug # Build with debugging information (useful for stacktraces)
npm run build -- --variant=debug-assertions # Build with assertions and "SAFE_HEAP=1", useful to find memory bugs.
npm run build -- --variant=debug-sanitizers # Build with memory sanitizers. Will be very slow.
```

It's then recommended to run the tests (`npm test`) to check if there are any obvious memory bugs found.

### About the internal steps of compilation

The npm _build_ task:

- Creates `Binaries/embuild` directory,
- Launches CMake inside to compile GDevelop with _emconfigure_ to use Emscripten toolchain,
- Updates the glue.cpp and glue.js from Bindings.idl using _Emscripten WebIDL Binder_,
- Launches the compilation with `make` (or `ninja` on Windows with CMake 3.17+) (you can also compile using MinGW-32 using `npm run build-with-MinGW`).

See the [CMakeLists.txt](./CMakeLists.txt) for the arguments passed to the Emscripten linker. For instance, if you want to see the function names in stacks or for profiling, the compilation flags can be changed.
