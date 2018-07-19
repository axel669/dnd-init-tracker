import React from 'react';

import DoricComponent from 'src/DoricComponent';

class AutoUpdateCheck extends DoricComponent {
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

export default AutoUpdateCheck
