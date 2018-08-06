import React from 'react';
import {Provider, connect} from 'react-redux';

import doric from 'doric-components';
import autobind from 'autobind-decorator';
import update from 'immutable-update-values';

// import store from './store/store.js';
// import actions from './store/actions.js';

// import {Router, Route, RouteSwitch} from './components/Route.js';
// import InitManager from './screen/InitManager.js';
// import PartyManager from './screen/PartyManager.js';

// window.Router = Router;
// window.actions = actions;

const cblog = ::console.log;

const MainMenu = ({toggle}) => {
    const route = url =>
        () => {
            Router.replace(url);
            toggle();
        };

    return (
        <React.Fragment>
            <doric.button text="Initiatives" style={{color: 'black'}} onTap={route("/")} />
            <doric.button text="Manage Parties" style={{color: 'black'}} onTap={route("/party")} />
        </React.Fragment>
    );
};

const storage = {
    get(name, defaultValue = null) {
        const value = localStorage.getItem(name);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value);
    },
    set(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }
};

const bton = b => b ? 1 : 0;
const ston = s => parseInt(s);

class AddPlayer extends doric.baseComponent {
    constructor(props) {
        super(props);
        this.state = {name: "", init: "", player: true, id: Date.now()};
        this.link = this.createLinks(...Object.keys(this.state));
    }

    @autobind
    cancel() {
        this.props.close(null);
    }
    @autobind
    add() {
        const c = {...this.state};
        c.init = ston(c.init);
        c.playerValue = bton(c.player);
        this.props.close(c);
    }

    render() {
        const {name, init, player} = this.state;
        const {close} = this.props;

        const disabled = (name === "" || init === "");
        const content = (
            <React.Fragment>
                <doric.input.text label="Name" value={name} onChange={this.link.name} />
                <doric.input.number label="Initiative" value={init} onChange={this.link.init} />
            </React.Fragment>
        );
        const actions = (
            <doric.grid>
                <doric.grid.col size={6}>
                    <doric.button block danger flat text="Cancel" onTap={this.cancel} />
                </doric.grid.col>
                <doric.grid.col size={6}>
                    <doric.button block primary flat text="Add" onTap={this.add} disabled={disabled} />
                </doric.grid.col>
            </doric.grid>
        );
        return <doric.dialog title="Add Initiative" content={content} actions={actions} />;
    }
}

doric.style.add({
    'center-text': {
        display: 'table',
        width: '100%',
        height: '100%'
    },
    "center-text::after": {
        display: 'table-cell',
        textAlign: 'center',
        verticalAlign: 'middle',
        content: 'attr(data-text)'
    },
    "doric-button[small]": {
        padding: 1
    },
    "doric-card[selected='true']": {
        backgroundColor: '#a2d3e2'
    }
});
const Creature = ({creature, onFocus, selected}) => {
    const focus = () => onFocus(creature.id);

    return (
        <doric.card tabIndex={1} onFocus={focus} selected={selected}>
            {creature.init} {creature.name}
        </doric.card>
    );
};

doric.style.add({
    "side-menu": {
        position: 'absolute',
        right: '100%',
        bottom: 0,
        width: 100,
    },
    "action-menu": {
        position: 'fixed',
        bottom: 0,
        right: 0
    },
    "doric-button[circle]": {
        width: 40,
        height: 40
    }
});

const sortFunc = (a, b) => {
    const initCheck = a.init - b.init;
    if (initCheck !== 0) {
        return initCheck;
    }
    return a.playerValue - b.playerValue;
}
class InitTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inits: storage.get('inits', []),
            selected: null,
            // menuOpen: false
        };
    }

    @autobind
    moveUp() {
    }
    @autobind
    moveDown() {
        const {inits: oldInits, selected} = this.state;

        if (oldInits.length < 2) {
            return;
        }

        const item = oldInits.find(i => i.id === selected);
        const index = oldInits.indexOf(item);

        if (index === oldInits.length - 1) {
            return;
        }

        const inits = [...oldInits];
        inits.splice(index, 1);
        inits.splice(index + 1, 0, item);
        this.setState({inits});
    }
    @autobind
    async edit() {
    }
    @autobind
    async remove() {
        const selected = this.state.selected;
        const name = this.state.inits.find(i => i.id === selected).name;
        const confirm = await this.dialog.confirm(
            `Remove ${name} from initiative?`,
            "Remove"
        );

        if (confirm === true) {
            const inits = this.state.inits.filter(i => i.id !== selected);
            this.setState({inits, selected: null});
        }
    }

    @autobind
    async reset() {
        const reset = await this.dialog.confirm("Reset initiaives?");

        if (reset === true) {
            this.setState({inits: []});
        }
    }

    @autobind
    async add(){
        const creature = await this.dialog.show(AddPlayer);
        if (creature !== null) {
            let {inits} = this.state;
            inits = update(inits, {$push: creature});
            this.setState({inits});
        }
    }

    @autobind
    select(selected) {
        this.setState({selected});
    }

    componentDidUpdate() {
        storage.set('inits', this.state.inits);
    }

    render() {
        const {inits, selected, menuOpen} = this.state;

        return (
            <doric.appContainer title="Init Tracker">
                {inits.map(
                    (creature, index) =>
                        <Creature key={creature.id}
                            onFocus={this.select}
                            selected={selected === creature.id}
                            creature={creature} />
                )}
                <div style={{height: 96}} />

                <action-menu>
                    <doric.iconButton danger action circle icon="ion-refresh" onTap={this.reset} />
                    <br />
                    <doric.iconButton primary action circle icon="ion-plus" onTap={this.add} />
                    <side-menu>
                        <doric.iconButton disabled={selected === null} action circle icon="ion-chevron-up" onTap={this.moveUp} />
                        <doric.iconButton disabled={selected === null} danger action circle icon="ion-trash-b" onTap={this.remove} />
                        <doric.iconButton disabled={selected === null} action circle icon="ion-chevron-down" onTap={this.moveDown} />
                        <doric.iconButton disabled={selected === null} primary action circle icon="ion-edit" onTap={this.edit} />
                    </side-menu>
                </action-menu>
            </doric.appContainer>
        );
    }
}
const Main = doric.dialogify(InitTracker);

doric.init(
    <Main />,
    document.querySelector("app-root")
);
