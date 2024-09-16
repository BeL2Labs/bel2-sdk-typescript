const { override, addWebpackResolve, addWebpackPlugin } = require("customize-cra");
const webpack = require('webpack');

module.exports = override(
    addWebpackResolve({
        fallback: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            vm: false,
            process: require.resolve('process/browser.js'), // Add .js extension
        }
    }),
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            process: 'process/browser.js', // Add .js extension
            Buffer: ['buffer', 'Buffer']
        })
    )
);
