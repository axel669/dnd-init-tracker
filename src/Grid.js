doric.Grid = (() => {
    const gridStyle = {
        "doric-grid": {
            display: 'block'
        },
        "doric-grid::before": {
            content: `" "`,
            display: 'table'
        },
        "doric-grid::after": {
            content: `" "`,
            display: 'table',
            clear: 'both'
        },
        "doric-col": {
            float: 'left'
        }
    };

    for (const i of (1).to(13)) {
        const width = ((i / 12) * 100).toPrecision(8);
        gridStyle[`doric-col.w${i}`] = {
            width: `${width}%`
        };
        gridStyle[`doric-col.offset${i}`] = {
            marginLeft: `${width}%`
        };
    }

    // console.log(gridStyle);
    sheet.addStyles(gridStyle);

    return ({children}) => {
        return (
            <doric-grid>
                {children}
            </doric-grid>
        );
    };
})();
doric.Col = ({size = 1, offset = null, ...props}) => {
    let className = `w${size}`;
    if (offset !== null) {
        className = `${className} offset${offset}`;
    }
    return <doric-col class={className} {...props} />;
};
doric.GridBreak = () => <doric-col class="w12" />;
