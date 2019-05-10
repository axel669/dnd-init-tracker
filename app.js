(function (React, ReactDOM, doric) {
    'use strict';

    var React__default = 'default' in React ? React['default'] : React;
    ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;
    doric = doric && doric.hasOwnProperty('default') ? doric['default'] : doric;

    var sorts = {
        string: (a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        },
        number: (a, b) => a - b,
        reverse: (sortFunc) => (a, b) => -sortFunc(a, b),
        map: (mapFunc, sortFunc) => (a, b) => sortFunc(mapFunc(a), mapFunc(b)),
        prop: (propName, sortFunc) => {
            const propFunc = new Function("source", `return source${propName}`);
            return (a, b) => sortFunc(propFunc(a), propFunc(b));
        },
        compose: (...sortFuncs) => (a, b) => {
            for (const sortFunc of sortFuncs) {
                const compared = sortFunc(a, b);
                if (compared !== 0) {
                    return compared;
                }
            }
            return 0;
        },
        natural: new Intl.Collator(undefined, {
            numeric: true
        }).compare
    };

    var arraySort = sorts;

    const actions = {
        $set: (source, value) => value,
        $unset: (source, names) => {
            const copy = {
                ...source
            };
            for (const name of names) {
                delete copy[name];
            }
            return copy;
        },
        $push: (source, value) => [...source, value],
        $append: (source, value) => [...source, ...value],
        $apply: (source, func) => func(source),
        $filter: (source, condition) => source.filter(condition),
        $merge: (source, addition) => ({
            ...source,
            ...addition
        })
    };
    const internal_copyObject = (obj, createIfVoid = false) => {
        if (Array.isArray(obj) === true) {
            return [...obj];
        }
        if (obj === undefined && createIfVoid === true) {
            return {};
        }
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        if (obj instanceof Map) {
            return new Map(obj);
        }
        if (obj instanceof Set) {
            return new Set(obj);
        }
        if (obj.constructor !== Object) {
            return obj;
        }
        return {
            ...obj
        };
    };
    const internal_setValues = (dest, key, n, value, create) => {
        const name = key[n];
        if (n === key.length - 1) {
            return actions[name](dest, value);
        } else {
            dest = internal_copyObject(dest, create);
            dest[name] = internal_setValues(dest[name], key, n + 1, value, create);
        }
        return dest;
    };
    const update = (source, obj, createIfUndefined = false) =>
        Object.keys(obj).reduce(
            (source, key) =>
                internal_setValues(
                    source,
                    key.split("."),
                    0,
                    obj[key],
                    createIfUndefined
                ),
            source
        );
    update.actions = actions;

    var immutableUpdate = update;

    const cssNoMeasurement = new Set([
        "animation-iteration-count",
        "box-flex",
        "box-flex-group",
        "box-ordinal-group",
        "column-count",
        "fill-opacity",
        "flex",
        "flex-grow",
        "flex-positive",
        "flex-shrink",
        "flex-negative",
        "flex-order",
        "font-weight",
        "line-clamp",
        "line-height",
        "opacity",
        "order",
        "orphans",
        "stop-opacity",
        "stroke-dashoffset",
        "stroke-opacity",
        "stroke-width",
        "tab-size",
        "widows",
        "z-index",
        "zoom"
    ]);
    const cssPrefixes = ["-webkit-", "-moz-", "-ms-", "-o-", ""];
    const prefixMap = ["user-select"].reduce(
        (prefixes, name) => ({
            ...prefixes,
            [name]: cssPrefixes
        }),
        {}
    );

    const renderCSS = ([selector, valueBase], tab, depth, theme) => {
        const tabString = tab.repeat(depth);

        const parts = [];

        if (Array.isArray(valueBase) === true) {
            parts.push(`${tabString}${selector} {`);
            parts.push(...valueBase.map(
                value => renderCSS(value, tab, depth + 1, theme)
            ));
            parts.push(`${tabString}}`);
        }
        else {
            const name = getCSSName(selector);
            const value = getCSSValue(valueBase, name, theme);
            if (value !== null) {
                const selectors = getPrefixedSelector(name);
                for (const _name of selectors) {
                    for (const _value of value) {
                        parts.push(`${tabString}${_name}: ${_value};`);
                    }
                }
            }
        }

        return parts.join("\n");
    };
    const getPrefixedSelector = selector => (prefixMap[selector] || [""])
        .map(prefix => `${prefix}${selector}`);
    const getCSSName = name => name.replace(
        /[A-Z]/g,
        (s) => `-${s.toLowerCase()}`
    );
    const getCSSValue = (value, name, theme) => {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === "function") {
            return getCSSValue(value(theme), name, theme);
        }

        if (Array.isArray(value) === true) {
            return value.map(
                val => getCSSValue(val, name, theme)
            );
        }

        if (value.toCSS !== undefined) {
            return [value.toCSS()];
        }

        if (typeof value === "number" && cssNoMeasurement.has(name) === false) {
            return [`${value}px`];
        }

        return [value];
    };

    const prepObj = (obj, parent = "", current = [], top = []) => {
        for (const [selectorBase, value] of Object.entries(obj)) {
            const selector = selectorBase.replace(/&/g, parent);

            if (parent === "" || selectorBase.indexOf("&") !== -1) {
                const items = [];
                top.push([selector, items]);
                prepObj(value, selector, items, top);
            }
            else {
                if (typeof value === "object" && value.toCSS === undefined) {
                    const items = [];
                    current.push([selector, items]);
                    prepObj(value, selector, items, top);
                }
                else {
                    current.push([selector, value]);
                }
            }
        }

        return top;
    };
    const lerp = (from, to, by) => from + ((to - from) * by);
    const sumsq = values => values.reduce((total, n) => total + (n ** 2), 0);
    const blendValues = values => Math.sqrt(sumsq(values) / values.length);
    const color = (r, g, b, a = 1) => ({
        get r() {return r},
        get g() {return g},
        get b() {return b},
        get a() {return a},
        opacity: alpha => color(r, g, b, alpha),
        invert: () => color(255 - r, 255 - g, 255 - b, a),
        darken: factor => color(
            lerp(r, 0, factor)|0,
            lerp(g, 0, factor)|0,
            lerp(b, 0, factor)|0,
            a
        ),
        lighten: factor => color(
            lerp(r, 255, factor)|0,
            lerp(g, 255, factor)|0,
            lerp(b, 255, factor)|0,
            a
        ),
        toCSS: () => `rgba(${r}, ${g}, ${b}, ${a})`
    });
    color.fromHex = hex => {
        if (hex.startsWith("#") === true) {
            hex = hex.slice(1);
        }
        const [r, g, b, a] = (hex.length <= 4)
            ? [
                parseInt(hex.slice(0, 1).repeat(2), 16),
                parseInt(hex.slice(1, 2).repeat(2), 16),
                parseInt(hex.slice(2, 3).repeat(2), 16),
                parseInt(hex.slice(3, 4).repeat(2) || "FF", 16) / 255,
            ]
            : [
                parseInt(hex.slice(0, 2), 16),
                parseInt(hex.slice(2, 4), 16),
                parseInt(hex.slice(4, 6), 16),
                parseInt(hex.slice(6, 8) || "FF", 16) / 255,
            ];

        return color(r, g, b, a);
    };
    color.blend = (...colors) => color(
        blendValues(colors.map(c => c.r))|0,
        blendValues(colors.map(c => c.g))|0,
        blendValues(colors.map(c => c.b))|0,
        blendValues(colors.map(c => c.a))
    );

    const initUpdate = (attrs) => {
        if (typeof window !== "undefined") {
            const element = document.createElement("style");

            for (const [attr, value] of Object.entries(attrs)) {
                element.setAttribute(attr, value);
            }

            document.querySelector("head").appendChild(element);

            return css => {
                element.innerHTML = css;
                return css;
            };
        }

        return css => css;
    };
    const sheet = (styles, attrs = {}) => {
        const cssSource = prepObj(styles);

        const update = initUpdate(attrs);

        return {
            generate: (theme, tab = "    ") => update(
                cssSource
                    .map(decl => renderCSS(decl, tab, 0, theme))
                    .join("\n")
            )
        };
    };

    sheet.color = color;

    var ssjs = sheet;

    doric.generateCSS(doric.tronTheme);
    const storage = {
      read: (name, defValue) => {
        let source = localStorage.getItem(name);

        if (source === null) {
          return defValue;
        }

        return JSON.parse(source);
      },
      write: (name, data) => localStorage.setItem(name, JSON.stringify(data))
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
        "&[type='ally']": { ...bg.ally,
          "& doric-title": bg.ally
        },
        "&[type='enemy']": { ...bg.enemy,
          "& doric-title": bg.enemy
        }
      },
      "select": {
        WebkitAppearance: "none"
      }
    }).generate();
    const initSort = arraySort.reverse(arraySort.compose(arraySort.prop(".init.value", arraySort.number), arraySort.prop(".init.mod", arraySort.number)));
    const {
      store,
      actions: actions$1
    } = Norn({
      units: {
        initial: storage.read("units", []),
        $update: (units, {
          oldUnit,
          newUnit
        }) => immutableUpdate(units, {
          [`${units.indexOf(oldUnit)}.$set`]: newUnit
        }).sort(initSort),
        $delete: (units, {
          removeUnit
        }) => units.filter(unit => unit !== removeUnit),
        $add: (units, {
          newUnit
        }) => [...units, newUnit].sort(initSort)
      }
    }, {
      "units.$update": (oldUnit, newUnit) => ({
        oldUnit,
        newUnit
      }),
      "units.$delete": removeUnit => ({
        removeUnit
      }),
      "units.$add": newUnit => ({
        newUnit
      })
    });
    store.subscribe(state => storage.write("units", state.units));

    const formatInit = ({
      value,
      mod
    }) => {
      const plus = "+".repeat(Math.max(0, mod));
      const minus = "-".repeat(Math.max(0, -mod));
      return `${value}${plus}${minus}`;
    };

    const parseInit = stringValue => {
      const info = /^(?<value>\-?\d+)(?<plus>\+*)(?<minus>\-*)$/.exec(stringValue);
      const value = parseInt(info.groups.value, 10);
      const mod = info.groups.plus.length - info.groups.minus.length;
      return {
        value,
        mod
      };
    };

    const useMount = effect => React.useEffect(effect, []);

    const useInputState = (initialValue, allow = () => true) => {
      const [value, update] = React.useState(initialValue);
      return [value, evt => {
        const updated = evt.target.value;

        if (allow(updated) === true) {
          update(updated);
        }
      }];
    };

    const useSelectState = initialValue => {
      const [value, update] = React.useState(initialValue);
      return [value, evt => update(evt.value)];
    };

    const typeOptions = [{
      label: "Ally",
      value: "ally"
    }, {
      label: "Enemy",
      value: "enemy"
    }];

    function CharacterEdit(props) {
      const inputRef = React.useRef();

      const close = () => props.close(null);

      const [name, updateName] = useInputState(props.unit.name);
      const [init, updateInit] = useInputState(formatInit(props.unit.init), value => value.match(/^([0-9]+(\+*|\-*))?$/) !== null);
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

      useMount(() => {
        inputRef.current.focus();
      });
      return React__default.createElement(doric.Panel, null, React__default.createElement(doric.Input, {
        label: "Name",
        ref: inputRef,
        value: name,
        onChange: updateName
      }), React__default.createElement(doric.Input, {
        label: "Initiative",
        value: init,
        onChange: updateInit
      }), React__default.createElement(doric.Select, {
        label: "Unit Type",
        value: type,
        onChange: updateType,
        options: typeOptions
      }), React__default.createElement(doric.Panel.actions, null, React__default.createElement(doric.Button, {
        danger: true,
        flat: true,
        text: "Cancel",
        onTap: close
      }), React__default.createElement(doric.Button, {
        primary: true,
        flat: true,
        text: "Ok",
        onTap: submit
      })));
    }

    doric.Dialog.register("character", CharacterEdit, {
      unit: {
        name: "",
        init: {
          value: 0,
          mod: 0
        },
        type: "ally"
      },
      window: {
        class: ["top", "small"]
      }
    });
    const UnitDisplay = React.memo(function UnitDisplay(props) {
      const {
        unit
      } = props;

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

        actions$1["units.$delete"](unit);
      };

      const edit = async () => {
        const newUnit = await doric.Dialog.character({
          unit
        });

        if (newUnit === null) {
          return;
        }

        actions$1["units.$update"](unit, newUnit);
      };

      const initDisplay = formatInit(unit.init);
      const imageURL = unit.type === "ally" ? allyImage : enemyImage;
      return React__default.createElement(doric.Panel, {
        type: unit.type
      }, React__default.createElement(doric.Title, {
        title: unit.name,
        subtitle: initDisplay
      }), React__default.createElement(doric.Panel.media, null, React__default.createElement("media-flex", null, React__default.createElement(doric.Button, {
        primary: true,
        flat: true,
        block: true,
        bordered: true,
        icon: "ion-md-create",
        onTap: edit
      }), React__default.createElement(doric.Button, {
        danger: true,
        flat: true,
        block: true,
        bordered: true,
        icon: "ion-md-trash",
        onTap: remove
      }))));
    });
    const Main = NornConnectHook(store)(function Main(props) {
      const addChar = async () => {
        const newUnit = await doric.Dialog.character();

        if (newUnit === null) {
          return;
        }

        actions$1["units.$add"](newUnit);
      };

      return React__default.createElement("div", {
        style: {
          width: 480,
          maxWidth: "100%",
          margin: "auto",
          position: "relative"
        }
      }, React__default.createElement(doric.Navbar, {
        title: "Init Manager"
      }), React__default.createElement("div", {
        style: {
          position: "sticky",
          zIndex: "+5",
          top: 40,
          backgroundColor: "black",
          padding: 2
        }
      }, React__default.createElement(doric.Button, {
        primary: true,
        flat: true,
        bordered: true,
        block: true,
        icon: "ion-md-add",
        text: "Add Unit",
        onTap: addChar
      })), props.units.map((unit, index) => React__default.createElement(UnitDisplay, {
        key: index,
        unit: unit
      })));
    });
    ReactDOM.render(React__default.createElement(Main, null), document.querySelector("app-root"));

}(React, ReactDOM, doric));
