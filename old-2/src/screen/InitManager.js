import React from 'react';
import {connect} from 'react-redux';

import doric from 'doric-components';
import autobind from 'autobind-decorator';

import actions from '../store/actions.js';
import {Route} from '../components/Route.js';

class AddDialog extends doric.baseComponent {
    constructor(props) {
        super(props);
        this.state = {
            init: '',
            name: "",
            inputName: '',
            type: 'player'
        };
        this.link = this.createLinks(...Object.keys(this.state));
    }

    @autobind
    cancel() {
        this.props.close(null);
    }
    @autobind
    add() {
        const {init} = this.state;
        this.props.close(this.state);
    }

    render() {
        const {name, inputName, init} = this.state;

        const disabled = (
            (name === "")
            || (name === "!new" && inputName === "")
            || (init === "")
        );
        const radioLayout = {
            container: doric.grid,
            itemProps: props => ({...props, size: 6})
        };

        const content = (
            <React.Fragment>
                <doric.select label="Creature" value={this.state.name} onChange={this.link.name}>
                    <option value="" hidden>Select a creature</option>
                    {this.props.players.map(
                        player => <option key={player.id} value={player.name}>{player.type}: {player.name}</option>
                    )}
                    <option value="!new">New Creature</option>
                </doric.select>
                {(name === "!new") && (
                    <React.Fragment>
                        <doric.input.text label="Name" value={this.state.inputName} onChange={this.link.inputName} />
                        <doric.radio value={this.state.type} onChange={this.link.type} layout={radioLayout}>
                            <option value="player">Player</option>
                            <option value="Enemy">Enemy</option>
                        </doric.radio>
                    </React.Fragment>
                )}
                <doric.input.number label="Initiative" value={this.state.init} onChange={this.link.init} />
            </React.Fragment>
        );
        const actions = (
            <doric.grid>
                <doric.grid.col size={6}><doric.button block danger flat text="Cancel" onTap={this.cancel} /></doric.grid.col>
                <doric.grid.col size={6}><doric.button block primary flat disabled={disabled} text="Add" onTap={this.add} /></doric.grid.col>
            </doric.grid>
        );
        return <doric.dialog title="Add Initiative" content={content} actions={actions} />;
    }
}
const AddPlayerDialog = connect(i => i)(AddDialog);

class InitManager extends doric.baseComponent {
    constructor(props) {
        super(props);
    }

    @autobind
    async addPlayer() {
        const value = await this.dialog.show(AddPlayerDialog);

        // switch (true) {
        //     case (value === null): {
        //         break;
        //     }
        //     case (value.name === "!new"): {
        //         actions.batch.dispatch(
        //             actions.players.add(value.inputName, value.type),
        //             actions.inits.add(value.inputName, parseInt(value.init))
        //         );
        //         break;
        //     }
        //     default: {
        //         actions.inits.add.dispatch(value.name, parseInt(value.init));
        //     }
        // }
    }

    render() {
        return (
            <React.Fragment>
                <doric.button.pure block primary text="Add" onTap={this.addPlayer} />
                {this.props.inits.map(
                    entity => <div key={entity.key}>{entity.name}: {entity.init}</div>
                )}
            </React.Fragment>
        );
    }
}

export default connect(i => i)(doric.dialogify(InitManager));
