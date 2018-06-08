doric.Button = (() => {
    sheet.addStyles({
        "doric-button": {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            padding: '4px 8px',
            margin: '3px 4px',
            position: 'relative',
            top: 0,
            left: 0,
            overflow: 'hidden',
            minWidth: 69,
            minHeight: 35,
            color: 'white',
            backgroundColor: 'transparent'
        },
        "doric-button[block]": {
            display: 'flex'
        },
        "doric-button[snug]": {
            padding: 0
        },
        "doric-button[disabled]": {
            opacity: 0.7
        },
        "doric-button::after": {
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            content: `""`,
            transition: 'background-color 250ms linear'
        },
        "doric-button[data-tap-active]:not([disabled])::after": {
            backgroundColor: doric.values.hl,
            transition: 'none'
        },
        "doric-button-content": {
            flexGrow: 1,
            textAlign: 'center'
        },
        "doric-button[block='true']": {
            display: 'flex'
        },
        "doric-button[primary='true']": {
            backgroundColor: '#004e8d'
        }
    });

    return props => {
        const {
            text,
            children,
            onTap = (() => {}),
            ...passThrough
        } = props;

        return (
            <doric-button {...passThrough}>
                <doric.CustomListeners listeners={{onTap}} />
                <doric-button-content>
                    {text || children}
                </doric-button-content>
            </doric-button>
        );
    };
})();
