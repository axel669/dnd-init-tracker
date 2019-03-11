(function () {
    'use strict';

    var sorts = {
        string: (a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        },
        number: (a, b) => a - b,
        reverse: (func) => (a, b) => 0 - func(a, b),
        map: (mapFunc, sortFunc) => (a, b) => sortFunc(mapFunc(a), mapFunc(b)),
        prop: (propName, sortFunc) => {
            const pfunc = new Function("source", `return source${propName}`);
            return (a, b) => sortFunc(pfunc(a), pfunc(b));
        },
        compose: (...funcs) => (a, b) => {
            for (const sort of funcs) {
                const pos = sort(a, b);
                if (pos !== 0) {
                    return pos;
                }
            }
            return 0;
        }
    };

    var storage = {
        read: (name, defValue) => {
            const source = localStorage.getItem(name);
            if (source === null) {
                return defValue;
            }
            return JSON.parse(source);
        },
        write: (name, data) => localStorage.setItem(name, JSON.stringify(data))
    };

    const sortInit = sorts.compose(
        sorts.prop(".init", sorts.reverse(sorts.number)),
        sorts.prop(".offset", sorts.reverse(sorts.number))
    );
    const { actions, ...store } = Norn(
        {
            inits: {
                initial: () => storage.read("inits", []),
                $add: (inits, { type, ...init }) => {
                    const newInits = [...inits, init].sort(sortInit);
                    return newInits;
                },
                $update: (inits, { type, id, ...info }) => {
                    const index = inits.findIndex((i) => i.id === id);
                    return immutableUpdate([...inits], {
                        [`${index}.$apply`]: (value) => ({
                            ...value,
                            ...info
                        })
                    }).sort(sortInit);
                },
                $remove: (inits, { id }) => inits.filter((init) => init.id !== id)
            }
        },
        {
            "inits.$add": (name, init) => ({
                name: name,
                init: init,
                offset: 0,
                id: Date.now()
            }),
            "inits.$update": (id, info, name) => ({
                id: id,
                ...info,
                name: name
            }),
            "inits.$remove": (id) => ({
                id: id
            })
        }
    );
    store.subscribe(({ inits }) => storage.write("inits", inits));

    const disp = (offset) =>
        offset < 0 ? "-".repeat(-offset) : "+".repeat(offset);
    const parse = (str) => {
        const [, strValue, plus, minus] = str.match(/(\d+)(\++)?(\-+)?/);
        const init = parseInt(strValue);
        const offset = (() => {
            switch (true) {
                case plus === undefined && minus === undefined:
                    return 0;
                case plus !== undefined:
                    return plus.length;
                default:
                    return 0 - minus.length;
            }
        })();
        return {
            init: init,
            offset: offset
        };
    };
    var offset = {
        disp: disp,
        parse: parse
    };

    class CreatureEdit extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                name: this.props.item.name,
                init: `${this.props.item.init}${offset.disp(
                this.props.item.offset
            )}`
            };
        }
        componentDidMount() {
            this.input.focus();
        }
        render() {
            const { name, init } = this.state;
            const cancel = () => this.props.close(null);
            const save = () => this.props.close(this.state);
            const remove = async () => {
                const confirmed = await doric.dialog.confirm("Remove from combat?");
                if (confirmed === true) {
                    actions["inits.$remove"](this.props.item.id);
                    this.props.close(null);
                }
            };
            const update = (name) => (evt) =>
                this.setState({
                    [name]: evt.target.value
                });
            const ref = (domInput) => {
                this.input = domInput;
            };
            return React.createElement(
                "alert-dialog",
                {},
                React.createElement(
                    "alert-content",
                    {
                        wide: true
                    },
                    React.createElement(doric.input, {
                        label: "Name",
                        value: name,
                        onChange: update("name")
                    }),
                    React.createElement(doric.input, {
                        domRef: ref,
                        label: "Initiative",
                        value: init,
                        onChange: update("init")
                    })
                ),
                React.createElement(
                    doric.grid,
                    {
                        cols: 3
                    },
                    React.createElement(
                        doric.button,
                        {
                            block: true,
                            danger: true,
                            flat: true,
                            onTap: cancel
                        },
                        React.createElement("ion-icons", {
                            class: "ion-md-close"
                        })
                    ),
                    React.createElement(
                        doric.button,
                        {
                            block: true,
                            danger: true,
                            onTap: remove
                        },
                        React.createElement("ion-icons", {
                            class: "ion-md-trash"
                        })
                    ),
                    React.createElement(
                        doric.button,
                        {
                            block: true,
                            primary: true,
                            onTap: save
                        },
                        React.createElement("ion-icons", {
                            class: "ion-md-save"
                        })
                    )
                )
            );
        }
    }

    const InitDisplay = ({ item }) =>
        React.createElement(
            doric.grid,
            {
                cols: 5
            },
            React.createElement("div", {}, item.init, offset.disp(item.offset)),
            React.createElement(
                "div",
                {
                    gcolspan: 4
                },
                item.name
            )
        );

    const connect = (app, reducer = (state, props) => state) => (Component) => {

        return class extends React.PureComponent {
            constructor(props) {
                super(props);
                this.state = reducer(app.state, this.props);
                this.unsub = app.subscribe((newState) =>
                    this.setState(() => reducer(newState, this.props))
                );
            }
            componentWillUnmount() {
                return this.unsub();
            }
            render() {
                return React.createElement(Component, {
                    ...{
                        ...this.props,
                        ...this.state
                    }
                });
            }
        };
    };
    const Main = connect(store)(
        class Main extends React.Component {
            async add() {
                const name = await doric.dialog.prompt(``, "Name");
                if (name === null) {
                    return;
                }
                actions["inits.$add"](name, 0);
            }
            async edit(evt) {
                const info = await doric.dialog.show(CreatureEdit, {
                    item: evt.item
                });
                if (info === null) {
                    return;
                }
                actions["inits.$update"](
                    evt.item.id,
                    offset.parse(info.init),
                    info.name
                );
            }
            render() {
                const { inits } = this.props;
                return React.createElement(
                    "div",
                    {},
                    React.createElement(
                        "div",
                        {
                            style: {
                                position: "fixed",
                                bottom: 0,
                                right: 0
                            }
                        },
                        React.createElement(
                            doric.button,
                            {
                                primary: true,
                                onTap: this.add,
                                circle: 45
                            },
                            React.createElement("ion-icon", {
                                class: "ion-md-add"
                            })
                        )
                    ),
                    React.createElement(doric.list, {
                        items: inits,
                        onItemTap: this.edit,
                        itemRenderer: InitDisplay
                    })
                );
            }
        }
    );

    ReactDOM.render(
        React.createElement(Main, {}),
        document.querySelector("app-root")
    );

}());
