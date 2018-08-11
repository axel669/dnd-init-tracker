import React from 'react';

import autobind from 'autobind-decorator';
import doric from 'doric-components';
import udpate from 'immutable-update-values';

import PlayerDialog from './PlayerDialog.js';
import storage from './storage.js';
import Grid from './Grid.js';


doric.style.add({
    "doric-button[circle]": {
        width: 40,
        height: 40
    },
    "bottom-grid": {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white'
    }
});

const BottomMenu = ({children}) => {
    // const kiddos = React.Children.toArray(children);
    return (
        <bottom-grid>
            <Grid>
                {React.Children.toArray(children)}
                {/* {kiddos.map(
                    (button, index) => (
                        <doric.grid.col size={4} key={index}>
                            {button}
                        </doric.grid.col>
                    )
                )} */}
            </Grid>
        </bottom-grid>
    );
};

@doric.dialogify
class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            inits: storage.read('inits', []),
            selected: null
        };
    }

    componentDidUpdate() {
        storage.write('inits', this.state.inits);
    }

    @autobind
    async add() {
        const next = await this.dialog.show(PlayerDialog);

        if (next !== null) {
            const {inits} = this.state;
            this.setState({
                inits: update(inits, {$push: next})
            });
        }
    }

    @autobind
    async edit() {
        const creature = this.state.find(c => c.id === this.state.selected);
        const next = await this.dialog.show(() => <PlayerDialog init={craeture} />);
        console.log(next);
    }

    @autobind
    async reset() {
        const clear = await this.dialog.confirm("Clear Initaitives?");

        if (clear === true) {
            this.setState({inits: []});
        }
    }

    @autobind
    select(id) {
        this.setState({selected: id});
    }

    render() {
        const {inits, selected} = this.state;

        return (
            <doric.appContainer title="Test">
                {inits.map(
                    (creature) => {
                        return <div key={creature.id}>{creature.name}</div>
                    }
                )}

                <doric.button onFocus={evt => console.log(evt)} text="Test" />

                <div style={{height: 90}} />
                <BottomMenu>
                    <doric.iconButton block
                        grid-size={4} icon="ion-chevron-up" />
                    <doric.iconButton block
                        grid-size={4} danger icon="ion-trash-b" text="Delete" />
                    <doric.iconButton block
                        grid-size={4} danger icon="ion-refresh" text="Clear" onTap={this.reset} />
                    <doric.iconButton block
                        grid-size={4} icon="ion-chevron-down" />
                    <doric.iconButton block
                        grid-size={4} primary icon="ion-edit" text="Edit" onTap={this.edit} />
                    <doric.iconButton block
                        grid-size={4} primary icon="ion-plus" text="Add" onTap={this.add} />
                </BottomMenu>
            </doric.appContainer>
        );
    }
}

doric.init(
    <Main />,
    document.querySelector("app-root")
);
