const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Ajv = require('ajv');

// config/*.json のJSON スキーマ定義
// ajv でバリデートするとき用
const configSchema = {
  "required": [
    "apiBase",
    "clientId"
  ],
  "properties": {
    "lsConfURL": {
      "type": "string",
    },
    "apiBase": {
      "type": "string",
    },
    "clientId": {
      "type": "string",
    },
    "signalingURL": {
      "type": "string",
    },
    "thetaZoomMaxRange": {
      "type": "number", "minimum": 1
    },
    "defaultLayout": {
      "type": "string",
      "pattern": "gallery|fullscreen|presentation",
    },
    "podCoordinates": {
      "type": "object",
      "required": [
        "upperLeft",
        "lowerRight"
      ],
      "properties": {
        "upperLeft": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "minItems": 2,
        },
        "lowerRight": {
          "type": "array",
          "items": {
            "type": "number"
          },
          "minItems": 2,
        }
      }
    },
    "room": {
      "type": "object",
      "properties": {
        "entranceScreen": {
          "type": "string",
          "pattern": "none|click",
        }
      }
    },
    "toolbar": {
      "type": "object",
      "properties": {
        "isHidden": {
          "type": "boolean",
        },
        "isHiddenCameraButton": {
          "type": "boolean",
        },
        "isHiddenMicButton": {
          "type": "boolean",
        },
        "isHiddenScreenShareButton": {
          "type": "boolean",
        },
        "isHiddenParticipantsButton": {
          "type": "boolean",
        },
        "isHiddenExitButton": {
          "type": "boolean",
        },
        "customItems": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": { 
              "itemId": {
                "type": "string",
              },
              "iconName": {
                "type": "string",
              },
            },
          },
        },
      }
    },
    "subView": {
      "type": "object",
      "properties": {
        "enableAutoVideoReceiving": {
          "type": "boolean"
        },
        "menu": {
          "type": "object",
          "properties": { 
            "isHidden": {
              "type": "boolean",
            },
            "isHiddenRecordingButton": {
              "type": "boolean",
            },
            "isHiddenSharePoVButton": {
              "type": "boolean",
            },
          }
        },
      }
    },
    "theme": {
      "type": "object",
      "properties": {
        "primary": {
          "type": "string",
        },
        "background": {
          "type": "string",
        },
        "surface": {
          "type": "string",
        },
        "onPrimary": {
          "type": "string",
        },
        "primaryTextColor": {
          "type": "string",
        },
        "secondaryTextColor": {
          "type": "string",
        },
        "components": {
          "type": "object",
          "properties": {
            "participantsVideoContainer": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "subViewSwitchBackgroundColor": {
                  "type": "string",
                },
                "subViewSwitchIconColor": {
                  "type": "string",
                },
              }
            },
            "toolbar": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "iconColor": {
                  "type": "string",
                },
              }
            },
            "video": {
              "type": "object",
              "properties": {
                "background": {
                  "type": "string",
                },
                "textColor": {
                  "type": "string",
                },
                "textBackgroundColor": {
                  "type": "string",
                },
                "iconColor": {
                  "type": "string",
                },
                "menuBackgroundColor": {
                  "type": "string",
                },
                "menuTextColor": {
                  "type": "string",
                },
                "highlightBorderColor": {
                  "type": "string",
                },
                "highlightShadowColor": {
                  "type": "string",
                },
              }
            },
            "dialog": {
              "type": "object",
              "properties": {
                "inputFocusColor": {
                  "type": "string",
                },
              }
            },
          }
        }
      }
    }
  }
}

function validateConfig(configPath) {
  const config = require(configPath);
  const ajv = new Ajv({allErrors: true});
  const validate = ajv.compile(configSchema)
  const valid = validate(config);
  if (!valid) {
    const errorMessage = `[invalid config] ${ajv.errorsText(validate.errors)} at ${configPath.toString()}`;
    throw new Error(errorMessage);
  }
  return config;
}

module.exports = (env, argv) => {
  const mode = process.env.NODE_ENV || 'development';
  const isProduction = mode === 'production';
  const watch = !isProduction && process.env.WATCH === 'true';
  // production とそれ以外で読み込む JSON を変える
  const configFileName = isProduction ? 'production.json' : 'local.json';
  const configPath = path.resolve(__dirname, `config/${configFileName}`);
  const { lsConfURL, clientId, apiBase, signalingURL, thetaZoomMaxRange, defaultLayout, toolbar, podCoordinates, theme, subView, room } = validateConfig(configPath);
  return {
    mode: mode,
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    devtool: isProduction ? false : 'source-map',
    devServer: {
      compress: true,
      port: 3000,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          pathRewrite: { '^/api': '' },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    plugins: [
      // XXX(kdxu): 一旦 TS のコンパイルを通すため設定値は process.env.XXX として渡している。他によい方法があればそちらを採用する
      new webpack.DefinePlugin({
        'process.env.DEBUG': !isProduction,
        'config.BACKEND_API_BASE': JSON.stringify(apiBase),
        'config.LS_CONF_URL': JSON.stringify(lsConfURL),
        'config.LS_CLIENT_ID': JSON.stringify(clientId),
        'config.LS_SIGNALING_URL': JSON.stringify(signalingURL),
        'config.DEFAULT_LAYOUT': JSON.stringify(defaultLayout),
        'config.THETA_ZOOM_MAX_RANGE': JSON.stringify(thetaZoomMaxRange),
        'config.ROOM_CONFIG': JSON.stringify(room),
        'config.TOOLBAR_CONFIG': JSON.stringify(toolbar),
        'config.POD_COORDINATES': JSON.stringify(podCoordinates),
        'config.SUBVIEW_CONFIG': JSON.stringify(subView),
        'config.THEME_CONFIG': JSON.stringify(theme),
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        sourceMap: true,
      }),
      new htmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
    ],
    optimization: {
      splitChunks: {
        name: 'vendor',
        chunks: 'initial',
      },
    },
    performance: {
      maxEntrypointSize: 1000000,
      maxAssetSize: 1000000,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: [
            // material-ui は source-map を提供してくれていないっぽいので除外
            /node_modules\/@material/,
            /node_modules\/@rmwc/,
          ],
        },
        {
          test: /\.css$/,
          sideEffects: true,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|webp|svg)$/i,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: 'src',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          loader: 'file-loader',
          options: {
            limit: 8192,
            name: '[path][name].[ext]',
            context: 'src',
          },
        },
      ],
    },
    watch,
  };
};
