import {writable} from "svelte/store"

import update from "@axel669/immutable-update"

const initSort = (a, b) => b.init - a.init
const internal = writable([])

const turns = {
    subscribe: internal.subscribe,
    add: (entry) => internal.update(
        (turns) => [...turns, entry]
    ),
    sort: () => internal.update(
        (turns) => [...turns].sort(initSort)
    ),
    moveDown: (id) => internal.update(
        (turns) => {
            const index = turns.findIndex(entry => entry.id === id)

            if (index === (turns.length - 1)) {
                return turns
            }

            return update(
                turns,
                {
                    [`${index}.$set`]: turns[index + 1],
                    [`${index + 1}.$set`]: turns[index],
                }
            )
        }
    ),
    moveUp: (id) => internal.update(
        (turns) => {
            const index = turns.findIndex(entry => entry.id === id)

            if (index === 0) {
                return turns
            }

            return update(
                turns,
                {
                    [`${index}.$set`]: turns[index - 1],
                    [`${index - 1}.$set`]: turns[index],
                }
            )
        }
    ),
    remove: (id) => internal.update(
        (turns) => turns.filter(entry => entry.id !== id)
    ),
    updateEntry: (id, actions) => internal.update(
        (turns) => {
            const index = turns.findIndex(entry => entry.id === id)

            return update(
                turns,
                {[`${index}.$apply`]: (item) => update(item, actions)}
            )
        }
    )
}

export default turns
