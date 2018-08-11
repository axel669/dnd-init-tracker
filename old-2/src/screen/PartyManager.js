import React from 'react';
import {connect} from 'react-redux';

import autobind from 'autobind-decorator';
import doric from 'doric-components';

import {Route, RouteSwitch, Router} from '../components/Route.js';
import actions from '../store/actions';

// const PartyList = (props) => {
//
// };
class PartyListBase extends React.Component {
    @autobind
    async addParty() {
        const partyName = await this.dialog.prompt("Party Name");

        if (partyName !== null) {
            actions.party.new.dispatch(partyName);
        }
    }

    render() {
        const {list} = this.props;

        return (
            <div>
                <doric.button primary block text="New Party" onTap={this.addParty} />
                {list.map(
                    name => <doric.button key={name} block text={name} onTap={() => Router.replace(`/party/${name}`)} />
                )}
            </div>
        );
    }
}
const PartyList = doric.dialogify(PartyListBase);
const PartyView = ({route, party}) => {
    return (
        <div>
            {/* <doric.grid>
                <doric.grid.col size={6}>
                    <doric.button block text="Add Player" />
                </doric.grid.col>
                <doric.grid.col size={6}>
                    <doric.button block>
                        Initiative &nbsp; <doric.icon icon="ion-chevron-right" />
                    </doric.button>
                </doric.grid.col>
            </doric.grid> */}
            <doric.button block text="Add Player" />
            <div>
                {JSON.stringify(party)}
            </div>
            <doric.button block>
                Combat &nbsp; <doric.icon icon="ion-chevron-right" />
            </doric.button>
        </div>
    );
};

class PartyManager extends React.Component {
    render() {
        const props = {
            'eval-title': p => {
                if (p.route.params.name === undefined) {
                    return p.title;
                }
                return p.route.params.name;
            },
            'eval-back': p => {
                if (p.route.params.name === undefined) {
                    return undefined;
                }
                return "Parties";
            },
            onBack: () => Router.replace("/")
        };

        return (
            // <doric.appContainer title="Party Manager">
                <RouteSwitch container={doric.appContainer} {...props}>
                    <Route path="/party/:name" component={PartyView} party={this.props.party} />
                    <Route component={PartyList} list={Object.keys(this.props.party)} title="Party List" />
                </RouteSwitch>
            // </doric.appContainer>
        );
    }
}

export default connect(i => ({party: i.party}))(
    doric.dialogify(PartyManager)
);
