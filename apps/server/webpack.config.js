const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const nodeExternals = require("webpack-node-externals")
const { RunScriptWebpackPlugin } = require("run-script-webpack-plugin")

module.exports = (options, webpack) => {
  const identifierModule = options.output.filename.split("/")
  return {
    ...options,
    entry: ["webpack/hot/poll?100", options.entry],
    target: "node",
    optimization: {
      minimize: false,
    },
    node: {
      __dirname: false,
    },
    externals: [
      nodeExternals({
        allowlist: ["webpack/hot/poll?100"],
      }),
    ],
    module: {
      rules: [
        {
          test: /my_client\/.*\.js$/,
          use: "imports-loader?define=>false",
        },
        {
          test: /.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["css-loader"],
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: "url-loader",
              options: {
                mimetype: "image/png",
              },
            },
          ],
        },
      ],
    },
    mode:
      process.env.NODE_ENV && process.env.NODE_ENV !== ""
        ? process.env.NODE_ENV
        : "development",
    resolve: {
      alias: {
        "@gateway-core": path.resolve(
          __dirname,
          "apps/@gateway-core/src/modules",
        ),
        "@constants": path.resolve(__dirname, "apps/constants"),
        "@decorators": path.resolve(__dirname, "apps/decorators"),
        "@filters": path.resolve(__dirname, "apps/filters"),
        "@guards": path.resolve(__dirname, "apps/guards"),
        "@interceptors": path.resolve(__dirname, "apps/interceptors"),
        "@interfaces": path.resolve(__dirname, "apps/interfaces"),
        "@mocks": path.resolve(__dirname, "apps/mocks"),
        "@pipes": path.resolve(__dirname, "apps/pipes"),
        "@schemas": path.resolve(__dirname, "apps/schemas"),
        "@utilities": path.resolve(__dirname, "apps/utilities"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: `${identifierModule[1]}.server.js`,
        autoRestart: false,
      }),
      // new CopyWebpackPlugin({
      //   patterns: [
      //     "./node_modules/swagger-ui-dist/swagger-ui.css",
      //     "./node_modules/swagger-ui-dist/swagger-ui-bundle.js",
      //     "./node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js",
      //     "./node_modules/swagger-ui-dist/favicon-16x16.png",
      //     "./node_modules/swagger-ui-dist/favicon-32x32.png",
      //   ],
      // }),
    ],
    output: {
      path: path.join(__dirname, "dist"),
      filename: `${identifierModule[1]}.server.js`,
    },
  }
}
