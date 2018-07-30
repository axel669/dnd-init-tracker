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

// class MainMenu extends React.Component {
// }
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

class AddPlayer extends doric.baseComponent {
    constructor(props) {
        super(props);
        this.state = {name: "", init: "", player: true, id: Date.now()};
        this.link = this.createLinks(...Object.keys(this.state));
    }

    render() {
        const {name, init, player} = this.state;
        const {close} = this.props;

        const disabled = (name === "" || init === "");
        const content = (
            <React.Fragment>
                <doric.input.text label="Name" value={name} onChange={this.link.name} />
                <doric.input.number label="Initiative" value={init} onChange={this.link.init} />
                <doric.radio value={player} onChange={this.link.player}>
                    <option value={true} label="Player" />
                    <option value={false} label="Enemy" />
                </doric.radio>
            </React.Fragment>
        );
        const actions = (
            <doric.grid>
                <doric.grid.col size={6}>
                    <doric.button block danger flat text="Cancel" onTap={() => close(null)} />
                </doric.grid.col>
                <doric.grid.col size={6}>
                    <doric.button block primary flat text="Add" onTap={() => close(this.state)} disabled={disabled} />
                </doric.grid.col>
            </doric.grid>
        );
        return <doric.dialog title="Add Initiative" content={content} actions={actions} />;
    }
}

const Creature = ({creature, moveUp, moveDown, remove}) => {
    // return <div>{creature.name}</div>;
    return (
        <doric.card>
            {/* <doric.card.title main={creature.name} subtitle={creature.init} /> */}
            <doric.grid>
                <doric.grid.col size={2}>
                    {creature.init}
                </doric.grid.col>
                <doric.grid.col size={10}>
                    {creature.name}
                </doric.grid.col>

                <doric.grid.break />

                <doric.grid.col size={4}>
                    <doric.button flush block>
                        <doric.icon icon="ion-trash-b" />
                    </doric.button>
                </doric.grid.col>
                <doric.grid.col size={4}>
                    <doric.button flush block>
                        <doric.icon icon="ion-chevron-down" />
                    </doric.button>
                </doric.grid.col>
                <doric.grid.col size={4}>
                    <doric.button flush block>
                        <doric.icon icon="ion-chevron-up" />
                    </doric.button>
                </doric.grid.col>
            </doric.grid>
        </doric.card>
    );
};

class InitTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {inits: storage.get('inits', [])};
    }

    @autobind
    moveUp(index) {
    }
    @autobind
    moveDown(index) {
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
            // storage.set('inits', inits);
            this.setState({inits});
        }
    }

    componentDidUpdate() {
        storage.set('inits', this.state.inits);
    }

    render() {
        return (
            <doric.appContainer title="Init Tracker">
                <div style={{paddingBottom: 30}}>
                    {this.state.inits.map(
                        (creature, index) => <Creature key={creature.id} {...{creature, index}} />
                    )}
                </div>

                <div style={{position: 'fixed', bottom: 0, right: 0, left: 0}}>
                    <doric.grid>
                        <doric.grid.col size={6}>
                            <doric.button block danger text="Reset" onTap={this.reset} />
                        </doric.grid.col>
                        <doric.grid.col size={6}>
                            <doric.button block primary text="Add" onTap={this.add} />
                        </doric.grid.col>
                    </doric.grid>
                </div>
            </doric.appContainer>
        );
    }
}
const Main = doric.dialogify(InitTracker);

doric.init(
    <Main />,
    // <Provider store={store}>
    //     {/* <Router enforce> */}
    //         {/* <RouteSwitch>
    //             <Route path="/" component={PartyManager} />
    //             <Route path="/inits/:party" component={InitManager} />
    //         </RouteSwitch> */}
    //         {/* <RouteSwitch container={doric.appContainer} menu={MainMenu} eval-title={t => t.title}>
    //             <Route path="/" component={PartyManager} title="Party Management" />
    //             <Route path="/" component={InitManager} title="Initiatives" />
    //         </RouteSwitch> */}
    //     {/* </Router> */}
    // {/* </Provider>, */}
    document.querySelector("app-root")
);
