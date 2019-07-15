'use strict';

const path = require('path');

module.exports = function(userConfig) {
  let limit = 1;

  if (userConfig.urlLoaderLimit !== false) {
    limit = userConfig.urlLoaderLimit || 10000;
  }

  const assetsPath = userConfig.assetsPath || 'static';

  return {
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      publicPath: '/dist/',
      filename: '[name].js',
      chunkFilename: '[name].chunk.js'
    },

    resolve: {
      symlinks: false,

      extensions: ['.js', '.json'],

      modules: ['node_modules']
    },

    resolveLoader: {},

    module: {
      rules: {
        js: {
          test: /\.(jsx?|babel|es6)$/,
          include: process.cwd(),
          exclude: /node_modules|bower_components/,
          use: {
            loader: 'babel-loader'
          }
        },
        json: {
          test: /\.json$/,
          use: {
            loader: 'json-loader'
          }
        },
        css: {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader'
            }
          ]
        },
        html: {
          test: /\.html$/,
          loader: 'html-loader',
          options: {
            attrs: ['img:src', 'link:href'],
            minimize: false
          }
        },
        font: {
          test: /\.otf|ttf|woff2?|eot(\?\S*)?$/,
          loader: 'url-loader',
          options: {
            limit: limit,
            name: path.posix.join(assetsPath, 'fonts', '[name].[hash:7].[ext]')
          }
        },
        svg: {
          test: /\.svg(\?\S*)?$/,
          loader: 'url-loader',
          options: {
            limit: limit,
            name: path.posix.join(assetsPath, 'image', '[name].[hash:7].[ext]')
          }
        },
        image: {
          test: /\.(gif|png|jpe?g|webp)(\?\S*)?$/,
          loader: 'url-loader',
          options: {
            limit: limit,
            name: path.posix.join(assetsPath, 'image', '[name].[hash:7].[ext]')
          }
        },
        media: {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: limit,
            name: path.posix.join(assetsPath, 'meida', '[name].[hash:7].[ext]')
          }
        }
      }
    },

    plugins: {},

    optimization: {
      minimizer: []
    }
  };
};
