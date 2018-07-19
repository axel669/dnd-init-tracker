import {gen} from 'redux-batching';

import store from './store.js';

const {action, batch} = gen(store);

const actions = {
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
        add: action('player.add', (name) => ({name, id: Date.now()}))
    }
};

export default actions;
