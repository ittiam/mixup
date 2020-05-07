const chalk = require('chalk');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

module.exports = args => mixup => {
  const { options } = mixup;

  serve(args, mixup, options);
};

async function serve(args, mixup, options) {
  const fs = require('fs-extra');
  const path = require('path');
  const url = require('url');
  const webpack = require('webpack');
  const WebpackDevServer = require('webpack-dev-server');
  const portfinder = require('portfinder');
  const clearConsole = require('react-dev-utils/clearConsole');
  const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
  const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
  const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
  const openBrowser = require('react-dev-utils/openBrowser');
  const launchEditorMiddleware = require('launch-editor-middleware');
  const prepareURLs = require('../../util/prepareURLs');
  const prepareProxy = require('../../util/prepareProxy');
  const isAbsoluteUrl = require('../../util/isAbsoluteUrl');

  const yarnLockFile = path.resolve(process.cwd(), 'yarn.lock');
  const useYarn = fs.existsSync(yarnLockFile);
  const isProduction = process.env.NODE_ENV === 'production';

  const isInteractive =
    process.stdout.isTTY && !process.env.MIXUP_CLI_INTERACTIVE;

  // resolve webpack config
  const webpackConfig = mixup.resolveWebpackConfig();

  // load user devServer options with higher priority than devServer
  // in webpack config
  const projectDevServerOptions = Object.assign(
    webpackConfig.devServer || {},
    options.devServer
  );

  // resolve server options
  const useHttps =
    args.https || projectDevServerOptions.https || process.env.HTTPS;
  const protocol = useHttps ? 'https' : 'http';
  const host = args.host || projectDevServerOptions.host || HOST;
  portfinder.basePort =
    args.port || projectDevServerOptions.port || DEFAULT_PORT;
  const port = await portfinder.getPortPromise();
  const rawPublicUrl = projectDevServerOptions.public;
  const publicUrl =
    args.public || rawPublicUrl
      ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
        ? rawPublicUrl
        : `${protocol}://${rawPublicUrl}`
      : null;

  const urls = prepareURLs(
    protocol,
    host,
    port,
    isAbsoluteUrl(options.publicPath) ? '/' : options.publicPath
  );

  const localUrlForBrowser = publicUrl || urls.localUrlForBrowser;

  const proxySettings = prepareProxy(
    projectDevServerOptions.proxy,
    mixup.resolve('public')
  );

  if (!isProduction) {
    const sockjsUrl = publicUrl
      ? // explicitly configured via devServer.public
        `?${publicUrl}/sockjs-node`
      : `?` +
        url.format({
          protocol,
          port,
          hostname: urls.lanUrlForConfig || 'localhost',
          pathname: '/sockjs-node',
        });

    // const devClients = [
    //   // dev server client
    //   require.resolve(`webpack-dev-server/client`) + sockjsUrl,
    //   // hmr client
    //   require.resolve(
    //     projectDevServerOptions.hotOnly
    //       ? 'webpack/hot/only-dev-server'
    //       : 'webpack/hot/dev-server'
    //   ),
    // ];
    const devClients = [require.resolve('mixup-dev-utils/webpackHotDevClient')];

    if (process.env.APPVEYOR) {
      devClients.push(`webpack/hot/poll?500`);
    }

    // inject dev/hot client
    addDevClientToEntry(webpackConfig, devClients);
  }

  // Compile our assets with webpack
  const clientCompiler = webpack(webpackConfig);

  // create server
  const clientDevServer = new WebpackDevServer(
    clientCompiler,
    Object.assign(
      {
        logLevel: 'silent',
        // clientLogLevel: 'silent',
        // overlay: { warnings: false, errors: true },
        clientLogLevel: 'none',
        overlay: false,
        transportMode: 'ws',
        quiet: true,
        historyApiFallback: {
          disableDotRule: true,
          rewrites: genHistoryApiFallbackRewrites(
            options.publicPath,
            options.pages
          ),
        },
        contentBase: mixup.resolve('public'),
        watchContentBase: true,
        hot: true,
        compress: false,
        injectClient: false,
        publicPath: options.publicPath,
      },
      projectDevServerOptions,
      {
        https: useHttps,
        proxy: proxySettings,
        // eslint-disable-next-line no-shadow
        before(app, server) {
          // This lets us fetch source contents from webpack for the error overlay
          app.use(evalSourceMapMiddleware(server));
          // This lets us open files from the runtime error overlay.
          app.use(errorOverlayMiddleware());
          // launch editor support.
          app.use(
            '/__open-stack-frame-in-editor',
            launchEditorMiddleware(() =>
              console.log(
                `To specify an editor, specify the EDITOR env variable or ` +
                  `add "editor" field to your project config.\n`
              )
            )
          );

          mixup.devServerConfigFns.forEach(fn => fn(app, server));
          // apply in project middlewares
          projectDevServerOptions.before &&
            projectDevServerOptions.before(app, server);
        },
        // avoid opening browser
        open: false,
      }
    )
  );

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      clientDevServer.close(() => {
        process.exit(0);
      });
    });
  });

  // on appveyor, killing the process with SIGTERM causes execa to
  // throw error
  if (process.env.MIXUP_CLI_TEST) {
    process.stdin.on('data', data => {
      if (data.toString() === 'close') {
        console.log('got close signal!');
        clientDevServer.close(() => {
          process.exit(0);
        });
      }
    });
  }

  return new Promise((resolve, reject) => {
    let isFirstCompile = true;
    clientCompiler.hooks.done.tap('done', stats => {
      if (!options.debug && isInteractive) {
        clearConsole();
      }

      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      // We only construct the warnings and errors for speed:
      // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
      });

      const messages = formatWebpackMessages(statsData);

      const isSuccessful = !messages.errors.length && !messages.warnings.length;
      if (isSuccessful) {
        console.log(chalk.green('Compiled successfully!'));
      }

      if (isSuccessful && isInteractive && isFirstCompile) {
        printInstructions(urls, useYarn);
      }

      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        console.log(chalk.red('Failed to compile.\n'));
        console.log(messages.errors.join('\n\n'));
        return;
      }

      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(messages.warnings.join('\n\n'));

        // Teach some ESLint tricks.
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      }

      if (isFirstCompile) {
        isFirstCompile = false;

        if (!isProduction) {
          console.log();
          console.log('Note that the development build is not optimized.');
          console.log(
            `To create a production build, use ` +
              `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
          );
          console.log();
        }

        resolve();
      }
    });

    clientDevServer.listen(port, host, err => {
      if (err) {
        return reject(err);
      }

      if (!options.debug && isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('\nStarting the development server...\n'));

      if (args.open || projectDevServerOptions.open) {
        const pageUri =
          projectDevServerOptions.openPage &&
          typeof projectDevServerOptions.openPage === 'string'
            ? projectDevServerOptions.openPage
            : '';
        openBrowser(localUrlForBrowser + pageUri);
      }
    });
  });
}

function addDevClientToEntry(config, devClient) {
  const { entry } = config;
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach(key => {
      entry[key] = devClient.concat(entry[key]);
    });
  } else if (typeof entry === 'function') {
    config.entry = entry(devClient);
  } else {
    config.entry = devClient.concat(entry);
  }
}

function printInstructions(urls, useYarn) {
  console.log();
  console.log(`  App running at:`);
  console.log();

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
    );
    console.log(
      `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
    );
  } else {
    console.log(`  ${urls.localUrlForTerminal}`);
  }
}

function genHistoryApiFallbackRewrites(publicPath, pages = {}) {
  const path = require('path');
  const multiPageRewrites = Object.keys(pages)
    // sort by length in reversed order to avoid overrides
    // eg. 'page11' should appear in front of 'page1'
    .sort((a, b) => b.length - a.length)
    .map(name => ({
      from: new RegExp(`^/${name}`),
      to: path.posix.join(publicPath, pages[name].filename || `${name}.html`),
    }));

  return [
    ...multiPageRewrites,
    { from: /./, to: path.posix.join(publicPath, 'index.html') },
  ];
}
