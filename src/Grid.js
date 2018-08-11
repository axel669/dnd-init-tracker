import React from 'react';

import doric from 'doric-components';

export default ({children, ...props}) => {
    children = React.Children.toArray(children);

    const mapped = children.map(
        child => {
            if (child.type === doric.grid.break) {
                return child;
            }
            const size = child.props['grid-size'];
            return (
                <doric.grid.col size={size}>
                    {child}
                </doric.grid.col>
            );
        }
    );
    return (
        <doric.grid {...props}>
            {mapped}
        </doric.grid>
    );
};
