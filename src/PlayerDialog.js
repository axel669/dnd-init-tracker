import React from 'react';

import doric from 'doric-components';
import autobind from 'autobind-decorator';

class PlayerDialog extends doric.baseComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: props.init?.name ?? "",
            init: props.init?.init ?? "",
            id: props.init?.id ?? Date.now()
        };
        this.buttonText = props.init === undefined ? "Add" : "Update";
        this.link = this.createLinks('name', 'init');
    }

    @autobind
    cancel() {
        this.props.close(null);
    }
    @autobind
    add() {
        const c = {...this.state};
        c.init = parseInt(c.init, 10);
        this.props.close(c);
    }

    render() {
        const {name, init} = this.state;
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
                    <doric.button block primary flat text={this.buttonText} onTap={this.add} disabled={disabled} />
                </doric.grid.col>
            </doric.grid>
        );
        return <doric.dialog title="Add Initiative" content={content} actions={actions} />;
    }
}

export default PlayerDialog;
