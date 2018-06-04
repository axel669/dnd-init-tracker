window.ReduxBatch = (() => {
    const gen = (store) => {
        const action = (type, constructor = (() => ({})), dispatches = true) => {
            const method = (...args) => {
                const obj = {
                    type,
                    ...constructor(...args)
                }
                if (dispatches === true) {
                    obj.dispatch = () => {
                        store.dispatch(obj);
                    };
                }
                return obj;
            };
            return method;
        };
        const batch = action(
            'batch',
            (...actions) => ({
                actions
            })
        );

        return {action, batch};
    };

    const batchReducer = (func) => {
        return (state, action) => {
            if (action.type === 'batch') {
                return action.actions.reduce(
                    (state, action) => func(state, action),
                    state
                );
            }
            return func(state, action);
        };
    };

    return {batchReducer, gen};
})();
