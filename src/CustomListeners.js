doric.CustomListeners = (() => {
    const globalListeners = {};
    const registerGlobalListener = (type, elem, handler) => {
        if (globalListeners.hasOwnProperty(type) === false) {
            globalListeners[type] = new Map();
            window.addEventListener(
                type,
                evt => {
                    const handlers = globalListeners[type];
                    for (const listener of handlers.keys()) {
                        if (listener.contains(evt.target) === true) {
                            handlers.get(listener)(evt);
                        }
                    }
                }
            );
        }

        globalListeners[type].set(elem, handler);
    };
    const removeGlobalListener = (type, elem) => {
        globalListeners[type].delete(elem);
    };

    class CustomListeners extends React.Component {
        constructor(props) {
            super(props);
        }

        componentDidMount = () => {
            const {listeners} = this.props;
            this.elem = ReactDOM.findDOMNode(this).parentNode;
            this.types = [];

            for (const type of Object.keys(listeners)) {
                const evtType = type.slice(2).toLowerCase();
                registerGlobalListener(evtType, this.elem, listeners[type]);
                this.types.push(evtType);
            }
        }

        componentWillUnmount = () => {
            for (const type of this.types) {
                removeGlobalListener(type, this.elem);
            }
        }

        render = () => {
            return <custom-listener style={{display: 'none'}} />;
        }
    }

    return CustomListeners;
})();
