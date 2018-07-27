import {createStore, combineReducers} from 'redux';
import {batchReducer} from 'redux-batching';
import update from 'immutable-update-values';

import storage from '../storage.js';

const storageBackup = (name, reducer) =>
    (state, action) => {
        const initialState = state;
        const newState = reducer(state, action);

        if (initialState !== newState) {
            storage.write(name, newState);
        }

        return newState;
    };

const inits = storageBackup('inits', batchReducer(
    (state = null, action) => {
        let newState = state;

        if (newState === null) {
            newState = {};
        }

        switch (action.type) {
            case 'inits.push':
                newState = update(newState, {$push: action.entity});
                break;
        }

        return newState;
    }
));

// const players = storageBackup('players', batchReducer(
//     (state = null, action) => {
//         let newState = state;
//
//         if (newState === null) {
//             newState = storage.read("players", []);
//         }
//
//         switch (action.type) {
//             case 'players.add':
//                 newState = update(state, {$push: action.player});
//                 break;
//         }
//
//         return newState;
//     }
// ));

const party = storageBackup('party', batchReducer(
    (state = null, action) => {
        let newState = state;

        if (newState === null) {
            newState = storage.read("party", {});
        }

        switch (action.type) {
            case 'party.new': {
                newState = update(
                    newState,
                    {[`${action.party}.$set`]: []}
                );
                break;
            }

            case 'party.add': {
                newState = update(
                    newState,
                    {[`${action.party}.$push`]: action.name}
                );
                break;
            }
        }

        return newState;
    }
));

export default createStore(
    combineReducers({
        inits,
        // players,
        party
    })
);
