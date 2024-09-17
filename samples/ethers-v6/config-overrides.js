const { override, addWebpackResolve, addWebpackPlugin } = require("customize-cra");
const webpack = require('webpack');

module.exports = override(
    addWebpackResolve({
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            vm: false,
            process: require.resolve('process/browser.js'),
        }
    }),
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer']
        })
    )
);
