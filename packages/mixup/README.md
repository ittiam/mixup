

## Quick Start

```bash
npm install -g create-mixup-app

create-mixup-app my-app
cd my-app
npm start
```

Then open http://localhost:3000/ to see your app.


**That's it**. You don't need to worry about setting up multiple webpack configs or other build tools. Just start editing `src/App.js` and go!

Below is a list of commands you will probably find useful.

### `npm start` or `yarn start`

Runs the project in development mode.
You can view your application at `http://localhost:3000`

The page will reload if you make edits.

### `npm run build` or `yarn build`

Builds the app for production to the build folder.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

### `npm run start:prod` or `yarn start:prod`

Runs the compiled app in production.

You can again view your application at `http://localhost:3000`

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm start -- --inspect=[host:port]` or `yarn start -- --inspect=[host:port]`

To debug the node server, you can use `razzle start --inspect`. This will start the node server and enable the inspector agent. The `=[host:port]` is optional and defaults to `=127.0.0.1:9229`. For more information, see [this](https://nodejs.org/en/docs/guides/debugging-getting-started/).

### `npm start -- --inspect-brk=[host:port]` or `yarn start -- --inspect-brk=[host:port]`

This is the same as --inspect, but will also break before user code starts. (to give a debugger time to attach before early code runs) For more information, see [this](https://nodejs.org/en/docs/guides/debugging-getting-started/).

### `rs`

If your application is running, and you need to manually restart your server, you do not need to completely kill and rebundle your application. Instead you can just type `rs` and press enter in terminal.

## <img src="https://user-images.githubusercontent.com/4060187/37915268-209644d0-30e7-11e8-8ef7-086b529ede8c.png" width="500px" alt="Razzle Hot Restart"/>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
  - [`npm start` or `yarn start`](#npm-start-or-yarn-start)
  - [`npm run build` or `yarn build`](#npm-run-build-or-yarn-build)
  - [`npm run start:prod` or `yarn start:prod`](#npm-run-startprod-or-yarn-startprod)
  - [`npm test` or `yarn test`](#npm-test-or-yarn-test)
  - [`npm start -- --inspect=[host:port]` or `yarn start -- --inspect=[host:port]`](#npm-start------inspecthostport-or-yarn-start------inspecthostport)
  - [`npm start -- --inspect-brk=[host:port]` or `yarn start -- --inspect-brk=[host:port]`](#npm-start------inspect-brkhostport-or-yarn-start------inspect-brkhostport)
  - [`rs`](#rs)
- [<img src="https://user-images.githubusercontent.com/4060187/37915268-209644d0-30e7-11e8-8ef7-086b529ede8c.png" width="500px" alt="Razzle Hot Restart"/>](#img-src%22httpsuser-imagesgithubusercontentcom406018737915268-209644d0-30e7-11e8-8ef7-086b529ede8cpng%22-width%22500px%22-alt%22razzle-hot-restart%22)
- [Customization](#customization)
  - [Plugins](#plugins)
    - [Using Plugins](#using-plugins)
    - [Writing Plugins](#writing-plugins)
  - [Customizing Babel Config](#customizing-babel-config)
  - [Extending Webpack](#extending-webpack)
  - [CSS Modules](#css-modules)
- [Environment Variables](#environment-variables)
  - [Build-time Variables](#build-time-variables)
  - [Runtime Variables](#runtime-variables)
  - [Adding Temporary Environment Variables In Your Shell](#adding-temporary-environment-variables-in-your-shell)
    - [Windows (cmd.exe)](#windows-cmdexe)
    - [Linux, macOS (Bash)](#linux-macos-bash)
  - [Adding Environment Variables In `.env`](#adding-environment-variables-in-env)
    - [What other `.env` files are can be used?](#what-other-env-files-are-can-be-used)
- [How Razzle works (the secret sauce)](#how-razzle-works-the-secret-sauce)
- [Inspiration](#inspiration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Customization

### Plugins

As of Razzle 2.0, you can add your plugins to modify your setup.

- [TypeScript](https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-typescript)
- [Vue](https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-vue)
- [Elm](https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-elm)
- [MDX](https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-mdx)
- [See All](https://www.npmjs.com/search?q=razzle-plugin)

#### Using Plugins

You can use Razzle plugins by installing in your project and adding them to your `razzle.config.js`. See the README.md of the specific plugin, but generally speaking, the flow is something like...

```bash
yarn add razzle-plugin-xxxx
```

```js
//./razzle.config.js
module.exports = {
  plugins: ['xxxx']
};
```

#### Writing Plugins

Plugins are simply functions that modify and return Razzle's webpack config.

```js
'use strict';

module.exports = function myRazzlePlugin(config, env, webpack, options) {
  const { target, dev } = env;

  if (target === 'web') {
    // client only
  }

  if (target === 'server') {
    // server only
  }

  if (dev) {
    // dev only
  } else {
    // prod only
  }

  // Do some stuff...
  return webpackConfig;
};
```

### Customizing Babel Config

Razzle comes with most of ES6 stuff you need. However, if you want to add your own babel transformations, just add a `.babelrc` file to the root of your project.

```js
{
  "presets": [
    "razzle/babel", // NEEDED
    "stage-0"
   ],
   "plugins": [
     // additional plugins
   ]
}
```

A word of advice: the `.babelrc` file will replace the internal razzle babelrc template. You must include at the very minimum the default razzle/babel preset.

### Extending Webpack

You can also extend the underlying webpack config. Create a file called `razzle.config.js` in your project's root.

```js
// razzle.config.js

module.exports = {
  modify: (config, { target, dev }, webpack) => {
    // do something to config

    return config;
  }
};
```

A word of advice: `razzle.config.js` is an escape hatch. However, since it's just JavaScript, you can and should publish your `modify` function to npm to make it reusable across your projects. For example, imagine you added some custom webpack loaders and published it as a package to npm as `my-razzle-modifictions`. You could then write your `razzle.config.js` like so:

```
// razzle.config.js
const modify = require('my-razzle-modifictions');

module.exports = {
  modify
}
```

Last but not least, if you find yourself needing a more customized setup, Razzle is _very_ forkable. There is one webpack configuration factory that is 300 lines of code, and 4 scripts (`build`, `start`, `test`, and `init`). The paths setup is shamelessly taken from [create-react-app](https://github.com/facebookincubator/create-react-app), and the rest of the code related to logging.

### CSS Modules

Razzle supports [CSS Modules](https://github.com/css-modules/css-modules) using Webpack's [css-loader](https://github.com/webpack-contrib/css-loader). Simply import your CSS file with the extension `.module.css` and Razzle will process the file using `css-loader`.

```jsx
import React from 'react';
import styles from './style.module.css';

const Component = () => <div className={styles.className} />;

export default Component;
```

## Environment Variables

### Build-time Variables

**The following environment variables are embedded during the build time.**

- `process.env.RAZZLE_PUBLIC_DIR`: Path to the public directory.
- `process.env.RAZZLE_ASSETS_MANIFEST`: Path to a file containing compiled asset outputs
- `process.env.REACT_BUNDLE_PATH`: Relative path to where React will be bundled during development. Unless you are modifying the output path of your webpack config, you can safely ignore this. This path is used by `react-error-overlay` and webpack to power up the fancy runtime error iframe. For example, if you are using common chunks and an extra entry to create a vendor bundle with stuff like react, react-dom, react-router, etc. called `vendor.js`, and you've changed webpack's output to `[name].js` in development, you'd want to set this environment variable to `/static/js/vendor.js`. If you do not make this change, nothing bad will happen, you will simply not get the cool error overlay when there are runtime errors. You'll just see them in the console. Note: This does not impact production bundling.
- `process.env.VERBOSE`: default is false, setting this to true will not clear the console when you make edits in development (useful for debugging).
- `process.env.PORT`: default is `3000`, unless changed
- `process.env.HOST`: default is `0.0.0.0`
- `process.env.NODE_ENV`: `'development'` or `'production'`
- `process.env.BUILD_TARGET`: either `'client'` or `'server'`
- `process.env.PUBLIC_PATH`: Only in used in `razzle build`. You can alter the `webpack.config.output.publicPath` of the client assets (bundle, css, and images). This is useful if you plan to serve your assets from a CDN. Make sure to _include_ a trailing slash (e.g. `PUBLIC_PATH=https://cdn.example.com/`). If you are using React and altering the public path, make sure to also [include the `crossorigin` attribute](https://reactjs.org/docs/cdn-links.html#why-the-crossorigin-attribute) on your `<script>` tag in `src/server.js`.
- `process.env.CLIENT_PUBLIC_PATH`: The NODE_ENV=development build's BUILD_TARGET=client has a different PUBLIC_PATH than BUILD_TARGET=server. Default is `http://${process.env.HOST}:${process.env.PORT + 1}/`. If you run your development environment on a specific url (e.g. process.env.HOST=10.1.2.3), you can set this to `http://10.1.2.3:3001/`.

You can create your own custom build-time environment variables. They must start
with `RAZZLE_`. Any other variables except the ones listed above will be ignored to avoid accidentally exposing a private key on the machine that could have the same name. Changing any environment variables will require you to restart the development server if it is running.

These environment variables will be defined for you on `process.env`. For example, having an environment variable named `RAZZLE_SECRET_CODE` will be exposed in your JS as `process.env.RAZZLE_SECRET_CODE`.

### Runtime Variables

Using the dotenv package, or by defining variables in your shell (see below), you can get access to runtime environment variables. This is useful for services like Heroku which dynamically set `process.env.PORT` for example. Be careful when referencing runtime variables in isomorphic code as they will be `undefined` in the browser, but defined when running in Node. This can lead to weird behavior. If you need to make runtime variables available to the browser, it is up to you to deliver them. You can stringify them and place them on `window`...

```js
// config.js
export const runtimeConfig =
  typeof window !== 'undefined'
    ? {
        // client
        myThing: window.env.myThing,
        anotherThing: window.env.anotherThing
      }
    : {
        // server
        myThing: process.env.MY_THING,
        anotherThing: process.env.ANOTHER_THING
      };
```

Now we set `window.env` as `runtimeConfig` when we go to render the HTML.

```js
import App from './App';
import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript'; // Safer stringify, prevents XSS attacks
import { runtimeConfig } from './config';
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const markup = renderToString(<App />);
    res.send(
      // prettier-ignore
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
    </head>
    <body>
        <div id="root">${markup}</div>
        <script>window.env = ${serialize(runtimeConfig)};</script>
        <script src="${assets.client.js}" defer crossorigin></script>
    </body>
</html>`
    );
  });

export default server;
```

### Adding Temporary Environment Variables In Your Shell

Defining environment variables can vary between OSes. It’s also important to know that this manner is temporary for the
life of the shell session.

#### Windows (cmd.exe)

```cmd
set RAZZLE_SECRET_CODE=abcdef&&npm start
```

(Note: the lack of whitespace is intentional.)

#### Linux, macOS (Bash)

```bash
RAZZLE_SECRET_CODE=abcdef npm start
```

### Adding Environment Variables In `.env`

To define permanent environment variables, create a file called .env in the root of your project:

```
RAZZLE_SECRET_CODE=abcdef
```

#### What other `.env` files are can be used?

- `.env`: Default.
- `.env.local`: Local overrides. **This file is loaded for all environments except test.**
- `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
- `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

Files on the left have more priority than files on the right:

- `npm start`: `.env.development.local`, `.env.development`, `.env.local`, `.env`
- `npm run build`: `.env.production.local`, `.env.production`, `.env.local`, `.env`
- `npm test`: `.env.test.local`, `.env.test`, `.env` (note `.env.local` is missing)

These variables will act as the defaults if the machine does not explicitly set them.<br>
Please refer to the [dotenv documentation](https://github.com/motdotla/dotenv) for more details.

> Note: If you are defining environment variables for development, your CI and/or hosting platform will most likely need
> these defined as well. Consult their documentation how to do this. For example, see the documentation for [Travis CI](https://docs.travis-ci.com/user/environment-variables/) or [Heroku](https://devcenter.heroku.com/articles/config-vars).

## How Razzle works (the secret sauce)

**TL;DR**: 2 configs, 2 ports, 2 webpack instances, both watching and hot reloading the same filesystem, in parallel during development and a little `webpack.output.publicPath` magic.

In development mode (`razzle start`), Razzle bundles both your client and server code using two different webpack instances running with Hot Module Replacement in parallel. While your server is bundled and run on whatever port you specify in `src/index.js` (`3000` is the default), the client bundle (i.e. entry point at `src/client.js`) is served via `webpack-dev-server` on a different port (`3001` by default) with its `publicPath` explicitly set to `localhost:3001` (and not `/` like many other setups do). Then the server's html template just points to the absolute url of the client JS: `localhost:3001/static/js/client.js`. Since both webpack instances watch the same files, whenever you make edits, they hot reload at _exactly_ the same time. Best of all, because they use the same code, the same webpack loaders, and the same babel transformations, you never run into a React checksum mismatch error.

## Inspiration

- [jaredpalmer/razzle](https://github.com/jaredpalmer/razzle)
- [facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app)

---

MIT License

