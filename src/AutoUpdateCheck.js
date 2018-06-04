doric.AutoUpdateCheck = (() => {
    class AutoUpdateCheck extends React.Component {
        constructor(props) {
            super(props);
        }

        shouldComponentUpdate = (nextProps, nextState) => {
            const currentp = this.props;
            for (const prop of this.propList) {
                if (currentp[prop] !== nextProps[prop]) {
                    return true;
                }
            }
            return this.state !== nextState;
        }
    }

    return AutoUpdateCheck;
})();
