import tea from "@axel669/teascript/rollup";

export default {
    input: "./src/app.tea",
    output: [
        {
            file: "app.js",
            format: "iife"
        }
    ],
    plugins: [
        tea({
            include: "**/*.tea"
        })
    ]
};
