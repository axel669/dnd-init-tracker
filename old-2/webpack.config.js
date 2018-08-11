module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'app.js',
        path: __dirname
    },
    mode: 'development',
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
