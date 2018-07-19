module.exports = (api) => {
    api.cache(false);
    return {
        presets: [
            "@babel/preset-react",
            ["@babel/preset-env", {useBuiltIns: 'usage'}],
            ["@babel/preset-stage-0", {decoratorsLegacy: true, pipelineProposal: 'minimal'}]
        ]
    };
};
