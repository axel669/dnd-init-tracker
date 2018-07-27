import {gen} from 'redux-batching';

import store from './store.js';

const {action, batch} = gen(store);

const actions = {
    batch,
    inits: {
        add: action(
            'inits.push',
            (name, init) => ({
                entity: {
                    name, init,
                    key: `${Date.now}:${Math.random()}`
                }
            })
        )
    },
    players: {
        add: action(
            'players.add',
            (name, type) => ({
                player: {
                    name, type,
                    id: Date.now()
                }
            })
        )
    },
    party: {
        new: action('party.new', (party) => ({party})),
        add: action('party.add', (party, name) => ({party, name}))
    }
};

export default actions;
