import React from 'react';

import autobind from 'autobind-decorator';
import doric from 'doric-components';
import update from 'immutable-update-values';
import ssjs from 'ssjs';

import PlayerDialog from './PlayerDialog.js';
import storage from './storage.js';
import Grid from './Grid.js';


const sheet = ssjs.create();

const swap = (arr, a, b) => {
    [a, b] = [Math.min(a, b), Math.max(a, b)];
    if (a < 0 || b >= arr.length) {
        return arr;
    }
    const res = [...arr];
    [res[a].init, res[b].init] = [res[b].init, res[a].init];
    [res[a], res[b]] = [res[b], res[a]];
    return res;
};

sheet.addStyles({
    "doric-button[circle]": {
        width: 40,
        height: 40
    },
    "bottom-grid": {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#010101',
        borderTop: "1px solid #1b2f2d"
    }
});

const BottomMenu = ({children}) => {
    return (
        <bottom-grid>
            <Grid>
                {children}
            </Grid>
        </bottom-grid>
    );
};

sheet.addStyles({
    "doric-card[selected='true']": {
        backgroundColor: 'rgba(0, 255, 255, 0.1)'
    }
});
const Creature = ({creature, selected, onFocus}) => {
    const focus = () => onFocus(creature.id);
    return (
        <doric.card tabIndex={1} onFocus={focus} selected={selected}>
            <span style={{padding: 4}}>{creature.init}</span>
            <span style={{padding: 4}}>{creature.name}</span>
        </doric.card>
    );
};

sheet.addStyles({
    "doric-app-titlebar": {
        backgroundColor: '#010101',
        borderBottom: "1px solid #1b2f2d"
    },
    "doric-dialog-container": {
        width: '60%',
        maxWidth: 320
    }
});
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
    updateInits(inits) {
        inits.sort((a, b) => b.init - a.init);
        this.setState({inits});
    }

    @autobind
    async add() {
        const next = await this.dialog.show(PlayerDialog);

        if (next !== null) {
            const {inits} = this.state;
            this.updateInits(update(inits, {$push: next}));
        }
    }

    @autobind
    async edit() {
        const {inits, selected} = this.state;
        const creature = inits.find(c => c.id === selected);
        const next = await this.dialog.show(({close}) => <PlayerDialog close={close} init={creature} />);

        if (next === null) {
            return;
        }

        const index = inits.findIndex(c => c.id === selected);
        this.updateInits(
            update(
                inits,
                {[`${index}.$set`]: next}
            )
        );
    }
    @autobind
    async remove() {
        const {inits, selected} = this.state;
        const creature = inits.find(c => c.id === selected);
        const remove = await this.dialog.confirm(`Remove ${creature.name}?`);

        if (remove === true) {
            const _inits = inits.filter(c => c.id !== selected);
            this.setState({
                inits: _inits,
                selected: null
            });
        }
    }

    @autobind
    moveUp() {
        const {inits, selected} = this.state;
        const index = inits.findIndex(c => c.id === selected);
        this.updateInits(
            swap(inits, index, index - 1)
        );
    }
    @autobind
    moveDown() {
        const {inits, selected} = this.state;
        const index = inits.findIndex(c => c.id === selected);
        this.updateInits(
            swap(inits, index, index + 1)
        );
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
            <doric.appContainer title="Initiative Manager">
                {inits.map(
                    (creature) => {
                        return <Creature key={creature.id}
                            creature={creature} selected={selected === creature.id}
                            onFocus={this.select} />;
                    }
                )}

                <div style={{height: 95}} />
                <BottomMenu>
                    <doric.iconButton block flat disabled={selected === null}
                        grid-size={4} icon="ion-chevron-up" onTap={this.moveUp} />
                    <doric.iconButton block flat disabled={selected === null}
                        grid-size={4} danger icon="ion-trash-b" text="Delete" onTap={this.remove} />
                    <doric.iconButton block flat
                        grid-size={4} danger icon="ion-refresh" text="Clear" onTap={this.reset} />
                    <doric.iconButton block flat disabled={selected === null}
                        grid-size={4} icon="ion-chevron-down" onTap={this.moveDown} />
                    <doric.iconButton block flat disabled={selected === null}
                        grid-size={4} primary icon="ion-edit" text="Edit" onTap={this.edit} />
                    <doric.iconButton block flat
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
sheet.attach();
