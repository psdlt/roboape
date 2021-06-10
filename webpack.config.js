const path = require('path');

module.exports = {
    mode: "development",
    target: 'node',
    entry: {
        app: './src/index.ts',
        syncModels: './src/syncModels.ts',
        dumpAll: './src/dumpAll.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: path.resolve(__dirname, 'node_modules'),
            },
            {
                test: /README$/,
                use: 'null-loader',
            },
            {
                test: /\.(cs|html)$/,
                use: 'null-loader',
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/
    },
    externals: {
        fsevents: "require('fsevents')",
        electron: "require('electron')",
    }
};