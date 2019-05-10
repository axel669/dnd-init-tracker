import React, {useRef, useEffect, useState, memo} from "react";
import ReactDOM from "react-dom";
import doric from "doric";
import sort from "@axel669/array-sort";
import update from "@axel669/immutable-update";
import ssjs from "ssjs";

doric.generateCSS(doric.tronTheme);

const storage = {
    read: (name, defValue) => {
        let source = localStorage.getItem(name);

        if (source === null) {
            return defValue;
        }

        return JSON.parse(source);
    },
    write: (name, data) => localStorage.setItem(
        name,
        JSON.stringify(data)
    )
};


const allyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkkGT4DwABVAEaCjJriwAAAABJRU5ErkJggg==";
const enemyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOUZGD4DwABbQEafpSlYQAAAABJRU5ErkJggg==";

const bg = {
    ally: {
        backgroundColor: ssjs.color(0, 25, 0)
    },
    enemy: {
        backgroundColor: ssjs.color(25, 0, 0)
    }
};

ssjs({
    "doric-title": {
        "& > span": {
            color: "lightgray",
            fontSize: 14
        }
    },
    "doric-button": {
        "&.bordered": {
            border: `2px solid ${doric.tronTheme["color.primary"]}`
        },
        "&:not(.bordered) > ion-icon": {
            marginRight: 4
        }
    },
    "media-flex": {
        display: "flex",
        alignItems: "stretch",
        height: "100%",
        "& > *": {
            flexGrow: 1
        }
    },
    "doric-panel": {
        "&[type='ally']": {
            ...bg.ally,
            "& doric-title": bg.ally
        },
        "&[type='enemy']": {
            ...bg.enemy,
            "& doric-title": bg.enemy
        },
    },
    "select": {
        WebkitAppearance: "none"
    }
}).generate();

const initSort = sort.reverse(
    sort.compose(
        sort.prop(".init.value", sort.number),
        sort.prop(".init.mod", sort.number)
    )
);

const {store, actions} = Norn(
    {
        units: {
            initial: storage.read("units", []),
            $update: (units, {oldUnit, newUnit}) => update(
                units,
                {[`${units.indexOf(oldUnit)}.$set`]: newUnit}
            ).sort(initSort),
            $delete: (units, {removeUnit}) => units.filter(
                unit => unit !== removeUnit
            ),
            $add: (units, {newUnit}) => [...units, newUnit].sort(initSort)
        }
    },
    {
        "units.$update": (oldUnit, newUnit) => ({oldUnit, newUnit}),
        "units.$delete": (removeUnit) => ({removeUnit}),
        "units.$add": (newUnit) => ({newUnit})
    }
);
store.subscribe(
    state => storage.write("units", state.units)
);

const formatInit = ({value, mod}) => {
    const plus = "+".repeat(Math.max(0, mod));
    const minus = "-".repeat(Math.max(0, -mod));

    return `${value}${plus}${minus}`;
};
const parseInit = stringValue => {
    const info = /^(?<value>\-?\d+)(?<plus>\+*)(?<minus>\-*)$/.exec(stringValue);

    const value = parseInt(info.groups.value, 10);
    const mod = info.groups.plus.length - info.groups.minus.length;

    return {value, mod};
};

const useMount = effect => useEffect(effect, []);
const useInputState = (initialValue, allow = () => true) => {
    const [value, update] = useState(initialValue);
    return [
        value,
        evt => {
            const updated = evt.target.value;
            if (allow(updated) === true) {
                update(updated);
            }
        }
    ];
};
const useSelectState = (initialValue) => {
    const [value, update] = useState(initialValue);
    return [value, evt => update(evt.value)];
};
const typeOptions = [
    {label: "Ally", value: "ally"},
    {label: "Enemy", value: "enemy"}
];
function CharacterEdit(props) {
    const inputRef = useRef();

    const close = () => props.close(null);
    const [name, updateName] = useInputState(props.unit.name);
    const [init, updateInit] = useInputState(
        formatInit(props.unit.init),
        value => value.match(/^([0-9]+(\+*|\-*))?$/) !== null
    );
    const [type, updateType] = useSelectState(props.unit.type);
    const submit = () => {
        if (name.trim() === "") {
            return;
        }

        props.close({
            name,
            type,
            init: parseInit(init)
        });
    };

    useMount(
        () => {
            inputRef.current.focus();
        }
    );

    return <doric.Panel>
        <doric.Input label="Name" ref={inputRef} value={name} onChange={updateName} />
        <doric.Input label="Initiative" value={init} onChange={updateInit} />
        <doric.Select label="Unit Type" value={type} onChange={updateType} options={typeOptions} />

        <doric.Panel.actions>
            <doric.Button danger flat text="Cancel" onTap={close} />
            <doric.Button primary flat text="Ok" onTap={submit} />
        </doric.Panel.actions>
    </doric.Panel>
}
doric.Dialog.register(
    "character",
    CharacterEdit,
    {
        unit: {
            name: "",
            init: {value: 0, mod: 0},
            type: "ally"
        },
        window: {
            class: ["top", "small"]
        }
    }
);

const UnitDisplay = memo(
    function UnitDisplay(props) {
        const {unit} = props;
        const remove = async () => {
            const confirmed = await doric.Dialog.confirm({
                message: `Remove ${unit.name} from initiative?`,
                title: null,
                center: true,
                okButton: "Yes",
                cancelButton: "No"
            });

            if (confirmed === false) {
                return;
            }

            actions["units.$delete"](unit);
        };
        const edit = async () => {
            const newUnit = await doric.Dialog.character({
                unit
            });

            if (newUnit === null) {
                return;
            }

            actions["units.$update"](unit, newUnit);
        };
        const initDisplay = formatInit(unit.init);
        const imageURL = (unit.type === "ally")
            ? allyImage
            : enemyImage;

        return <doric.Panel type={unit.type}>
            <doric.Title title={unit.name} subtitle={initDisplay} />
            <doric.Panel.media>
                <media-flex>
                    <doric.Button
                        primary flat block bordered
                        icon="ion-md-create"
                        onTap={edit}
                    />
                    <doric.Button
                        danger flat block bordered
                        icon="ion-md-trash"
                        onTap={remove}
                    />
                </media-flex>
            </doric.Panel.media>
        </doric.Panel>
    }
);

const Main = NornConnectHook(store)(
    function Main(props) {
        const addChar = async () => {
            const newUnit = await doric.Dialog.character();

            if (newUnit === null) {
                return;
            }

            actions["units.$add"](newUnit);
        };

        return <div style={{width: 480, maxWidth: "100%", margin: "auto", position: "relative"}}>
            <doric.Navbar title="Init Manager" />
            <div style={{position: "sticky", zIndex: "+5", top: 40, backgroundColor: "black", padding: 2}}>
                <doric.Button
                    primary flat bordered block
                    icon="ion-md-add"
                    text="Add Unit"
                    onTap={addChar}
                />
            </div>
            {props.units.map(
                (unit, index) => <UnitDisplay key={index} unit={unit} />
            )}
        </div>
    }
);

ReactDOM.render(
    <Main />,
    document.querySelector("app-root")
);
