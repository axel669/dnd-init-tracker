import {createStore, combineReducers} from 'redux';
import {batchReducer} from 'redux-batching';
import update from 'immutable-update-values';

import storage from '../storage.js';

const inits = batchReducer(
    (state = [], action) => {
        switch (action.type) {
            case 'inits.push':
                return update(state, {$push: action.entity});
        }

        return state;
    }
);

const players = (state = [], action) => {
    let newState = state;
    switch (action.type) {
        case 'players.add':
            newState = update(state, {$push: action.player});
            break;
    }

    if (newState !== state) {
        storage.write("players", newState);
    }

    return newState;
};

export default createStore(
    combineReducers({
        inits,
        players
    }),
    {
        players: storage.read('players', [])
    }
);
