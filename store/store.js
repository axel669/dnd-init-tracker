(() => {
    const {batchReducer, gen} = ReduxBatch;
    const allyList = batchReducer(
        (state = null, action) => {
            if (state === null) {
                return JSON.parse(localStorage.allyList || "[]");
            }

            switch (action.type) {
                case 'ally.add':
                    return [...state, action.ally];
            }

            return state;
        }
    );
    const enemyList = batchReducer(
        (state = null, action) => {
            if (state === null) {
                return [];
            }

            switch (action.type) {
                case 'enemy.add':
                    return [...state, action.enemy];
            }

            return state;
        }
    );

    const inits = batchReducer(
        (state = null, action) => {
            if (state === null) {
                return [];
            }

            switch (action.type) {
                case 'init.add':
                    return [...state, action.init];
                case 'init.sort': {
                    const copy = [...state];
                    return copy.sort(
                        (a, b) => (b.init - a.init) || (b.type - a.type)
                    );
                }
            }

            return state;
        }
    );

    const currentScreen = batchReducer(
        (state = null, action) => {
            if (state === null) {
                return 'main';
            }

            if (action.type === 'screen.set') {
                return action.screen;
            }
            if (action.type === 'screen.to-main') {
                return 'main';
            }

            return state;
        }
    );

    const store = Redux.createStore(
        Redux.combineReducers({
            allyList,
            enemyList,
            currentScreen,
            inits
        })
    );

    const {action, batch} = gen(store);
    window.store = store;
    window.actions = {
        batch,
        screen: {
            set: action('screen.set', screen => ({screen})),
            toMain: action('screen.to-main')
        },
        ally: {
            add: action('ally.add', ally => ({ally}))
        },
        inits: {
            add: action(
                'init.add',
                (name, init, type) => ({
                    init: {
                        name,
                        init: parseInt(init),
                        type: (type === 'ally') ? 1 : 0
                    }
                })
            ),
            sort: action('init.sort')
        },
        enemy: {
            add: action('enemy.add', enemy => ({enemy}))
        }
    };
})();
