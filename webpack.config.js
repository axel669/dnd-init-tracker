module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'app.js',
        path: __dirname
    },
    // devtool: 'inline-source-map',
    // mode: 'development',
    mode: 'production',
    node: {
        global: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules|doric-components/,
                loader: 'babel-loader'
            }
        ]
    }
};
