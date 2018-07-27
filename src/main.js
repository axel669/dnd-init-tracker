import React from 'react';
import {Provider, connect} from 'react-redux';

import doric from 'doric-components';
import autobind from 'autobind-decorator';

import store from './store/store.js';
import actions from './store/actions.js';

import {Router, Route, RouteSwitch} from './components/Route.js';
import InitManager from './screen/InitManager.js';
import PartyManager from './screen/PartyManager.js';

window.Router = Router;
window.actions = actions;

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

doric.init(
    <Provider store={store}>
        <Router enforce>
            <RouteSwitch>
                <Route path="/" component={PartyManager} />
                <Route path="/inits/:party" component={InitManager} />
            </RouteSwitch>
            {/* <RouteSwitch container={doric.appContainer} menu={MainMenu} eval-title={t => t.title}>
                <Route path="/" component={PartyManager} title="Party Management" />
                <Route path="/" component={InitManager} title="Initiatives" />
            </RouteSwitch> */}
        </Router>
    </Provider>,
    document.querySelector("app-root")
);
