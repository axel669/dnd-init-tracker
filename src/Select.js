doric.Select = (() => {
    sheet.addStyles({
        "doric-select": {
            display: 'block',
            margin: 3
        },
        "doric-select > select": {
            width: '100%',
            backgroundColor: 'black',
            color: 'white',
            height: 30
        },
        // "option, optgroup": {
        //     WebkitAppearance: 'none'
        // }
    });
    return props => {
        return (
            <doric-select>
                <select value={props.value} onChange={props.onChange}>
                    {props.children}
                </select>
            </doric-select>
        );
    };
})();
