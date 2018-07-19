import React from 'react';
import {Provider, connect} from 'react-redux';

import doric from 'doric-components';
import autobind from 'autobind-decorator';

import store from './store/store.js';
import actions from './store/actions.js';

console.log(1, 2, 3, 4);

class AddDialog extends doric.baseComponent {
    constructor(props) {
        super(props);
        this.state = {
            init: '',
            name: "",
            inputName: ''
        };
        this.link = this.createLinks(...Object.keys(this.state));
        console.log(this.link);
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

        const content = (
            <React.Fragment>
                <doric.select label="Creature" value={this.state.name} onChange={this.link.name}>
                    <option value="" hidden>Select a creature</option>
                    {this.props.players.map(
                        player => <option>{player}</option>
                    )}
                    <option value="!new">New Creature</option>
                </doric.select>
                {(name === "!new") && (
                    <React.Fragment>
                        <doric.input.text label="Name" value={this.state.inputName} onChange={this.link.inputName} />
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

        switch (true) {
            case (value === null): {
                console.log('not adding');
                break;
            }
            case (value.name === "!new"): {
                console.log('adding new', value.inputName);
                break;
            }
            default: {
                console.log('adding:', value.name);
            }
        }

        // console.log(value);
        // this.dialogs.show(
        //     {
        //         content: AddDialog,
        //         actions: ({close}) => <doric.button block text="Ok" onTap={close} />
        //     },
        //     {title: "Add Initiative"},
        //     this.props
        // );
        // actions.inits.add.dispatch('LUL', Math.random() * 20);
    }

    render() {
        return (
            <div style={{overflow: 'hidden'}}>
                <doric.button block primary text="Add" onTap={this.addPlayer} />
                {this.props.inits.map(
                    entity => <div key={entity.key}>{entity.name}: {entity.init}</div>
                )}
            </div>
        );
    }
}
const Main = connect(i => i)(doric.dialogify(InitManager));

doric.init(
    <Provider store={store}>
        <Main />
    </Provider>,
    document.querySelector("app-root")
);
