sheet.addStyles({
    "html, body": {
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%'
    },
    "body": {
        backgroundColor: '#000',
        color: 'white',
        fontFamily: 'Roboto',
        fontSize: 16
    },
    "*": {
        boxSizing: 'border-box'
    },
    "input[type='text']": {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottom: '2px solid white',
        color: 'white',
        display: 'block',
        width: '100%',
        height: 25
    },
    "button": {
        borderRadius: 0,
        border: '1px solid white',
        backgroundColor: 'transparent',
        color: 'white'
    }
});

sheet.attach();

const dialog = (() => {
    const dialogRoot = document.createElement('div');
    dialogRoot.style.position = 'absolute';
    dialogRoot.style.top = '0px';
    dialogRoot.style.left = '0px';

    document.body.appendChild(dialogRoot);

    const DialogBox = ({options, close}) => {
        return (
            <div style={{backgroundColor: '#00000040', position: 'fixed', width: '100%', height: '100%'}}>
                <div style={{position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white'}}>
                    <div><options.content /></div>
                    <div><options.buttons close={close} /></div>
                </div>
            </div>
        );
    };
    class Dialogs extends React.Component {
        constructor(props) {
            super(props);
            this.state = {list: []};
        }

        render() {
            const {list} = this.state;

            return (
                <React.Fragment>
                    {list.map(
                        (options, index) => {
                            close = () => {
                                const {list} = this.state;
                                list.splice(index, 1);
                                this.setState({list});
                            };
                            return <DialogBox key={options.id} options={options} close={close} />;
                        }
                    )}
                </React.Fragment>
            );
        }
    }

    const manager = ReactDOM.render(
        <Dialogs />,
        dialogRoot
    );

    return {
        show(options) {
            options = update(options, {"id.$set": `${Date.now()}:${Math.random()}`});
            const newState = update(
                manager.state,
                {"list.$push": [options]}
            );
            manager.setState(newState);
        }
    };
})();

store.subscribe(
    () => {
        localStorage.allyList = JSON.stringify(
            store.getState().allyList
        );
    }
);

class Tracker2 extends doric.AutoUpdateCheck {
    constructor(props) {
        super(props);
        this.propList = ['allyList', 'enemyList', 'inits'];
        this.state = {name: '', init: 10};
    }

    update = name =>
        evt => {
            const value = evt.target.value;
            this.setState(
                () => ({[name]: value})
            )
        }

    changeName = evt => {
        let value = evt.target.value;
        if (value === ':new-enemy') {
            value = prompt("Enemy Name", "");
            if (value === null || value.trim() === '') {
                return;
            }
        }
        actions.enemy.add(value).dispatch();
        this.setState(() => ({name: `enem:${value}`}));
    }

    add = () => {
        const {name, init} = this.state;
        const status = name.slice(0, 4);
        const realName = name.slice(5);
        this.setState(() => ({name: '', init: 10}));
        actions.inits.add(realName, init, status).dispatch();
    }
    sort = () => actions.inits.sort().dispatch()

    render = () => {
        const {name, init} = this.state;
        const {allyList, enemyList, inits} = this.props;

        return (
            <div>
                <doric.Button onTap={() => actions.screen.set('ally').dispatch()} text="Ally List" />
                <doric.Select value={name} onChange={this.changeName}>
                    <option value="" hidden>Name</option>
                    <optgroup label="Allies">
                        {allyList.map(
                            ally => <option value={`ally:${ally}`}>{ally}</option>
                        )}
                    </optgroup>
                    <optgroup label="Enemies">
                        <option value=":new-enemy">New Enemy</option>
                        {enemyList.map(
                            enemy => <option value={`enem:${enemy}`}>{enemy}</option>
                        )}
                    </optgroup>
                </doric.Select>
                <doric.Select value={init} onChange={this.update('init')}>
                    {new Array(41).fill(0).map((a, i) => <option value={i - 10}>{i - 10}</option>)}
                </doric.Select>
                <doric.Button onTap={this.add}>Add</doric.Button>
                <doric.Button onTap={this.sort} text="Sort" />
                {inits.map(
                    item => <div>{item.name} - {item.init}</div>
                )}
            </div>
        );
    }
}

class AllyScreen extends doric.AutoUpdateCheck {
    constructor(props) {
        super(props);
        this.propList = ['allyList'];
    }

    toMain = () => actions.screen.toMain().dispatch()
    add = () => {
        const newAlly = prompt("Name", "");

        if (newAlly !== null && newAlly.trim() !== '') {
            actions.ally.add(newAlly).dispatch();
        }
    };

    render = () => {
        const {allyList} = this.props;

        return (
            <div>
                <doric.Button onTap={this.toMain} text="Back" />
                <br />
                <doric.Button onTap={this.add} text="Add Ally" />
                <div>
                    {allyList.map(
                        name => <div>{name}</div>
                    )}
                </div>
            </div>
        );
    }
}

const screens = {
    main: Tracker2,
    ally: AllyScreen
};

const updateStore = prev => store.getState();
class ScreenChanger extends React.Component {
    constructor(props) {
        super(props);
        this.state = store.getState();
        store.subscribe(
            () => this.setState(updateStore)
        );
    }

    render = () => {
        const Screen = screens[this.state.currentScreen];
        return <Screen {...this.state} />;
    }
}

ReactDOM.render(
    <ScreenChanger />,
    document.querySelector("app-root")
);
