var doric = (function (react, ReactDOM) {
    'use strict';

    ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

    const isMobile =
        typeof orientation !== "undefined" ||
        navigator.userAgent.indexOf("Mobile") !== -1;
    const handlers = new Map();
    const touchVars = {};
    const addHandler = (name, handler) => {
        if (typeof handler === "function") {
            handler = handler();
        }
        handlers.set(name, handler);
        touchVars[name] = {};
    };
    const createEvent = (type, source) => {
        var ref0;

        const newEvt = new CustomEvent(type, {
            bubbles: true,
            cancelable: true
        });
        for (const prop of Object.keys((ref0 = source))) {
            const value = ref0[prop];
            newEvt[prop] = value;
        }
        return newEvt;
    };
    const copyTouchEvent = (touch) => ({
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        identifier: touch.identifier,
        target: touch.target,
        sourceElement: touch.sourceElement,
        id: touch.identifier
    });
    const copyForSynth = (touch) => ({
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        identifier: touch.identifier,
        id: touch.identifier
    });
    const delay = (func) => setTimeout(func, 0);
    const polarVector = (a, b) => {
        const dx = b.clientX - a.clientX;
        const dy = b.clientY - a.clientY;
        const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 450) % 360;
        const magnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        return {
            angle: angle,
            magnitude: magnitude
        };
    };
    const sharedVars = {};
    const touchMapper = (name, reset = false) => (touch) => {
        if (reset === true) {
            touchVars[name][touch.identifier] = {};
        }
        touchVars[name][touch.identifier] = {
            ...touchVars[name][touch.identifier],
            ...sharedVars[touch.identifier]
        };
        return {
            ...copyTouchEvent(touch),
            vars: touchVars[name][touch.identifier]
        };
    };
    const handleTouchList = (list, individual, touches, evt) => {
        if (list !== undefined) {
            list(touches, evt);
        }
        if (individual === undefined) {
            return;
        }
        for (const touch of touches) {
            individual(touch, evt);
        }
    };
    window.addEventListener(
        "touchstart",
        (evt) => {
            const touches = [...evt.changedTouches];
            for (const touch of touches) {
                touch.timestamp = Date.now();
                sharedVars[touch.identifier] = {
                    start: touch
                };
            }
            for (const [name, handler] of handlers) {
                handleTouchList(
                    handler.start,
                    handler.startItem,
                    touches.map(touchMapper(name, true)),
                    evt
                );
            }
        },
        false
    );
    window.addEventListener("touchmove", (evt) => {
        const touches = [...evt.changedTouches];
        for (const touch of touches) {
            const shared = sharedVars[touch.identifier];
            touch.timestamp = Date.now();
            shared.vector = polarVector(shared.start, touch);
        }
        for (const [name, handler] of handlers) {
            handleTouchList(
                handler.move,
                handler.moveItem,
                touches.map(touchMapper(name)),
                evt
            );
        }
    });
    window.addEventListener("touchend", (evt) => {
        const touches = [...evt.changedTouches];
        for (const touch of touches) {
            const shared = sharedVars[touch.identifier];
            touch.timestamp = Date.now();
            shared.vector = polarVector(shared.start, touch);
        }
        for (const [name, handler] of handlers) {
            handleTouchList(
                handler.end,
                handler.endItem,
                touches.map(touchMapper(name)),
                evt
            );
        }
    });
    if (isMobile === false) {
        console.log("GesturesJS will attach non-mobile listeners");
        const createSynthTouch = (mouseEvt) => ({
            ...copyTouchEvent(mouseEvt),
            identifier: -10,
            id: 10,
            target: currentMouseTarget,
            suorceElement: currentMouseTarget
        });
        let currentMouseTarget = null;
        let mouseIsDown = false;
        const dispatchSyntheticEvent = (evt, type) => {
            const changedTouches = [createSynthTouch(evt)];
            currentMouseTarget.dispatchEvent(
                createEvent(type, {
                    changedTouches: changedTouches,
                    touches: changedTouches,
                    syntheticEvent: true
                })
            );
        };
        window.addEventListener(
            "mousedown",
            (evt) => {
                if (evt.button === 0) {
                    mouseIsDown = true;
                    currentMouseTarget = evt.target;
                    dispatchSyntheticEvent(evt, "touchstart");
                }
            },
            true
        );
        window.addEventListener(
            "mousemove",
            (evt) => {
                if (mouseIsDown === true) {
                    dispatchSyntheticEvent(evt, "touchmove");
                }
            },
            true
        );
        window.addEventListener(
            "mouseup",
            (evt) => {
                if (evt.button === 0 && mouseIsDown === true) {
                    mouseIsDown = false;
                    dispatchSyntheticEvent(evt, "touchend");
                    currentMouseTarget = null;
                }
            },
            true
        );
    }
    const climbDOM = (start, func) => {
        let current = start;
        while (current !== null && current !== document.documentElement) {
            func(current);
            current = current.parentNode;
        }
    };
    addHandler("active-touch", () => {
        const className = "gjs-touch-active";
        const activeTouches = new WeakMap();
        const inc = (elem) => {
            var nullref0;

            const count =
                (nullref0 = activeTouches.get(elem)) != null ? nullref0 : 0;
            activeTouches.set(elem, count + 1);
        };
        const dec = (elem) => {
            const newCount = activeTouches.get(elem) - 1;
            activeTouches.set(elem, newCount);
            return newCount;
        };
        return {
            startItem: (touch) =>
                climbDOM(touch.target, (node) => {
                    node.classList.add(className);
                    inc(node);
                }),
            endItem: (touch) =>
                climbDOM(touch.target, (node) => {
                    if (dec(node) === 0) {
                        node.classList.remove(className);
                    }
                })
        };
    });
    addHandler("tap", () => {
        const className = "gjs-tap-active";
        const addClass = (node) => {
            node.classList.add(className);
        };
        const removeClass = (node) => {
            node.classList.remove(className);
        };
        return {
            startItem: (touch) => {
                if (touch.target.classList.contains(className) === false) {
                    touch.vars.valid = true;
                    touch.vars.active = true;
                    climbDOM(touch.target, addClass);
                }
            },
            moveItem: (touch) => {
                if (
                    touch.vars.active === true &&
                    touch.vars.vector.magnitude > 20
                ) {
                    touch.vars.valid = false;
                    climbDOM(touch.target, removeClass);
                }
            },
            endItem: (touch) => {
                if (touch.vars.active === true) {
                    climbDOM(touch.target, removeClass);
                }
                const duration = touch.timestamp - touch.vars.start.timestamp;
                if (touch.vars.vector.magnitude > 20 || duration > 600) {
                    return;
                }
                const synthEvent = createEvent("tap", copyForSynth(touch));
                delay(() => {
                    if (touch.target.dispatchEvent(synthEvent) === true) {
                        touch.target.focus();
                    }
                });
            }
        };
    });
    addHandler("hold", () => {
        const timers = {};
        const schedule = (touch) => {
            timers[touch.id] = setTimeout(() => {
                timers[touch.id] = null;
                touch.target.dispatchEvent(
                    createEvent("hold", copyForSynth(touch))
                );
            }, 1500);
        };
        const clear = (touch) => {
            clearTimeout(timers[touch.id]);
            timers[touch.id] = null;
        };
        return {
            startItem: (touch) => schedule(touch),
            moveItem: (touch) => {
                if (touch.vars.vector.magnitude > 20) {
                    clear(touch);
                }
            },
            endItem: (touch) => clear(touch)
        };
    });

    var nullref0, ref0;
    const cssNoMeasurement = new Set([
        "animationIterationCount",
        "boxFlex",
        "boxFlexGroup",
        "boxOrdinalGroup",
        "columnCount",
        "fillOpacity",
        "flex",
        "flexGrow",
        "flexPositive",
        "flexShrink",
        "flexNegative",
        "flexOrder",
        "fontWeight",
        "lineClamp",
        "lineHeight",
        "opacity",
        "order",
        "orphans",
        "stopOpacity",
        "strokeDashoffset",
        "strokeOpacity",
        "strokeWidth",
        "tabSize",
        "widows",
        "zIndex",
        "zoom"
    ]);
    const cssPrefixed = new Set(["userSelect"]);
    const cssPrefixes = ["-webkit-", "-moz-", "-ms-", "-o-", ``];
    const processValue = (key, value) => {
        const type = typeof value;
        if (type === "string") {
            return value;
        }
        if (type === "number" && cssNoMeasurement.has(key) === false) {
            return `${value}px`;
        }
        if (Array.isArray(value) === true) {
            return value.map((val) => cssValue(key, val));
        }
        return value;
    };
    const genParts = (css, theme, parent = ``, depth = -1) => {
        var ref0;

        const parts = [];
        const tabs = "    ".repeat(Math.max(0, depth));
        const innerTabs = "    ".repeat(depth + 1);
        const attachments = [];
        if (parent !== ``) {
            parts.push(`${tabs}${parent} {`);
        }
        for (const key of Object.keys((ref0 = css))) {
            const value = ref0[key];
            switch (true) {
                case key.indexOf("&") !== -1:
                    attachments.push(
                        genParts(value, theme, key.replace(/&/g, parent), depth)
                    );
                    break;
                case typeof value === "object" && Array.isArray(value) === false:
                    parts.push(genParts(value, theme, key, depth + 1));
                    break;
                default: {
                    const keyStr = key.replace(
                        /[A-Z]/g,
                        (letter) => `-${letter.toLowerCase()}`
                    );
                    const rawValue =
                        typeof value === "function" ? value(theme) : value;
                    const cssValue = processValue(key, rawValue);
                    switch (true) {
                        case cssPrefixed.has(key) === true:
                            for (const prefix of cssPrefixes) {
                                parts.push(
                                    `${innerTabs}${prefix}${keyStr}: ${cssValue};`
                                );
                            }
                            break;
                        case Array.isArray(cssValue) === true:
                            for (const value of cssValue) {
                                parts.push(`${innerTabs}${keyStr}: ${value};`);
                            }
                            break;
                        default:
                            parts.push(`${innerTabs}${keyStr}: ${cssValue};`);
                    }
                }
            }
        }
        if (parent !== ``) {
            parts.push(`${tabs}}`);
        }
        parts.push(...attachments);
        return parts.join("\n");
    };
    const Sheet = (() => {
        const construct = function construct(css, attr) {
            const self = {};
            const publicAPI = {};
            Object.defineProperties(publicAPI, {
                generate: {
                    configurable: false,
                    get: () => (theme) => {
                        self.elem.innerHTML = genParts(self.css, theme);
                    }
                }
            });
            Object.defineProperties(self, {});
            Object.defineProperties(
                self,
                Object.getOwnPropertyDescriptors(publicAPI)
            );
            Object.defineProperties(publicAPI, {});
            self.css = css;
            self.elem = document.createElement("style");
            const attributes = (nullref0 = attr) != null ? nullref0 : {};
            for (const key of Object.keys((ref0 = attributes))) {
                const value = ref0[key];
                self.elem.setAttribute(key, value);
            }
            document.querySelector("head").appendChild(self.elem);
            return publicAPI;
        };
        return (...args) => construct.apply({}, args);
    })();

    var ss = Sheet;

    const Color = (() => {
        const construct = function construct(...args) {
            const self = {};
            const publicAPI = {};
            Object.defineProperties(publicAPI, {
                opacity: {
                    configurable: false,
                    get: () => (alpha) => Color(self.r, self.g, self.b, alpha)
                },
                toString: {
                    configurable: false,
                    get: () => () => {
                        if (self.a === 1) {
                            return `rgb(${self.r}, ${self.g}, ${self.b})`;
                        }
                        return `rgba(${self.r}, ${self.g}, ${self.b}, ${self.a})`;
                    }
                }
            });
            Object.defineProperties(self, {});
            Object.defineProperties(
                self,
                Object.getOwnPropertyDescriptors(publicAPI)
            );
            Object.defineProperties(publicAPI, {
                inverse: {
                    configurable: false,
                    get: () =>
                        Color(255 - self.r, 255 - self.g, 255 - self.b, self.a)
                }
            });
            [self.r, self.g, self.b, self.a = 1] = (() => {
                switch (true) {
                    case typeof args[0] === "string": {
                        const color =
                            args[0].startsWith("#") === true
                                ? args[0].slice(1, undefined)
                                : args[0];
                        const alpha =
                            color.length > 6 ? color.slice(6, undefined) : "FF";
                        return [
                            parseInt(color.slice(0, 2), 16),
                            parseInt(color.slice(2, 4), 16),
                            parseInt(color.slice(4, 6), 16),
                            parseInt(alpha, 16) / 255
                        ];
                    }
                    default:
                        return args;
                }
            })();
            return publicAPI;
        };
        return (...args) => construct.apply({}, args);
    })();
    const tapActive = ".gjs-tap-active:not(.disabled):not(.flat)::after";
    const bcolorVariant = (color) => ({
        [`&.${color}`]: {
            backgroundColor: (theme) => theme.color[color],
            color: "white",
            "&.flat": {
                backgroundColor: "transparent",
                color: (theme) => theme.color[color]
            },
            [`&${tapActive}`]: {
                backgroundColor: (theme) => theme.highlightColor.inverse
            }
        }
    });
    const tappable = (color) => ({
        position: "relative",
        "&::after": {
            content: "''",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transition: "background-color 250ms linear"
        },
        "&.gjs-tap-active:not(.disabled)::after": {
            transition: "none",
            backgroundColor: color
        }
    });

    const blue = Color("#1d62d5");
    const theme = {
        highlightColor: Color(0, 0, 0, 0.4),
        outline: blue,
        focusOutline: `2px solid ${blue.opacity(0.5)}`,
        color: {
            primary: blue,
            secondary: Color("#128f12"),
            danger: Color("#F44336"),
            accent: Color("#FF4081")
        },
        bg: {
            color: "white"
        },
        label: {
            text: {
                normal: Color(0, 0, 0),
                required: Color(255, 0, 0),
                optional: Color(0, 128, 255)
            }
        },
        collapse: {
            border: {
                color: Color(0, 0, 0)
            }
        },
        input: {
            border: {
                focus: blue
            },
            label: {
                required: Color(255, 0, 0),
                optional: blue
            }
        }
    };

    const classes = (obj) => {
        var ref0;

        const list = [];
        for (const key of Object.keys((ref0 = obj))) {
            const value = ref0[key];
            if (key === "className" && value !== undefined) {
                list.push(value);
            }
            if (value === true) {
                list.push(key);
            }
        }
        return list.join(" ");
    };

    const climbDOM$1 = (start, func) => {
        let current = start;
        while (current !== null && current !== document.documentElement) {
            func(current);
            current = current.parentNode;
        }
    };
    const globalListeners = {};
    const registerGlobalListener = (type, elem, handler) => {
        if (globalListeners[type] === undefined) {
            globalListeners[type] = new Map();
            window.addEventListener(type, (evt) => {
                const handlers = globalListeners[type];
                climbDOM$1(evt.target, (node) => {
                    var nullref0;

                    return (nullref0 = handlers.get(node)) != null
                        ? nullref0(evt)
                        : undefined;
                });
            });
        }
        globalListeners[type].set(elem, handler);
    };
    const removeGlobalListener = (type, elem) => globalListeners[type].delete(elem);
    class CustomListeners extends react.Component {
        componentDidMount() {
            this.types = [];
            for (const name of Object.keys(this.props)) {
                const type = name.slice(2, undefined).toLowerCase();
                registerGlobalListener(type, this.elem, (evt) => {
                    var nullref0;

                    return (nullref0 = this.props[name]) != null
                        ? nullref0(evt)
                        : undefined;
                });
                this.types.push(type);
            }
        }
        componentWillUnmount() {
            for (const type of this.types) {
                removeGlobalListener(type, this.elem);
            }
        }
        render() {
            return React.createElement("doric-custom-listeners", {
                ref: (elem) => {
                    var nullref0;

                    this.elem =
                        (nullref0 = elem) != null ? nullref0.parentNode : undefined;
                },
                style: {
                    display: "none"
                }
            });
        }
    }

    const buttonSheet = ss(
        {
            "doric-button": {
                display: "inline-flex",
                padding: "8px 16px",
                borderRadius: 4,
                userSelect: "none",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                margin: 2,
                "&:hover": {
                    cursor: "pointer"
                },
                ...tappable((theme$$1) => theme$$1.highlightColor),
                ...bcolorVariant("primary"),
                ...bcolorVariant("secondary"),
                ...bcolorVariant("danger"),
                ...bcolorVariant("accent"),
                "&.block": {
                    display: "flex"
                },
                "&.disabled": {
                    opacity: 0.4
                },
                "&.snug": {
                    padding: 0
                },
                "&.flush": {
                    margin: 0
                },
                "&.raised": {
                    boxShadow: "2px 2px 3px rgba(0, 0, 0, 0.4)"
                }
            }
        },
        {
            name: "doric-button"
        }
    );
    buttonSheet.generate(theme);
    class Button extends react.PureComponent {
        render() {
            const {
                text,
                children,
                style = {},
                tabIndex = 1,
                circle,
                onTap,
                ...rest
            } = this.props;
            if (circle !== undefined) {
                style.width = circle;
                style.height = circle;
                style.padding = 0;
                style.borderRadius = "50%";
            }
            const props = {
                style: style,
                tabIndex: tabIndex,
                class: classes(rest)
            };
            const tapHandler = (evt) => {
                var nullref0;

                if (rest.disabled !== true) {
                    (nullref0 = onTap) != null ? nullref0(evt) : undefined;
                }
            };
            return React.createElement(
                "doric-button",
                {
                    ...props
                },
                React.createElement(CustomListeners, {
                    onTap: tapHandler
                }),
                text,
                children
            );
        }
    }

    const imageCSS = ss(
        {
            "doric-image": {
                display: "inline-block",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: "contain",
                "& > img": {
                    width: "100%",
                    height: "100%",
                    opacity: 0
                }
            }
        },
        {
            name: "doric-image"
        }
    );
    imageCSS.generate(theme);
    class Image extends react.PureComponent {
        render() {
            const {
                source,
                width,
                height,
                size,
                round,
                ...passThrough
            } = this.props;
            const border =
                round === true
                    ? {
                          borderRadius: Math.max(width, height)
                      }
                    : {};
            const style = {
                ...passThrough.style,
                backgroundImage: `url('${source}')`,
                backgroundSize: size,
                width: width,
                height: height,
                ...border
            };
            return React.createElement(
                "doric-image",
                {
                    ...passThrough,
                    style: style
                },
                React.createElement("img", {
                    src: source
                })
            );
        }
    }

    const panelCSS = ss(
        {
            "doric-panel": {
                display: "block",
                margin: 4,
                boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.4)",
                borderTop: "1px solid lightgray",
                backgroundColor: (theme$$1) => theme$$1.bg.color,
                overflow: "hidden",
                padding: 12,
                position: "relative",
                top: 0,
                left: 0,
                borderRadius: 4
            },
            "doric-panel-title": {
                display: "block",
                margin: -12,
                marginBottom: 0,
                padding: 4,
                "&::after": {
                    content: "' '",
                    display: "table",
                    clear: "both"
                },
                "& > div": {
                    fontSize: 20
                },
                "& > span": {
                    fontSize: 12,
                    color: "gray",
                    float: "left"
                },
                "& > doric-image": {
                    float: "left",
                    marginRight: 8
                }
            },
            "doric-panel-top": {
                position: "relative",
                display: "block",
                margin: -12,
                marginBottom: 0,
                padding: 4
            },
            "doric-panel-bottom": {
                position: "relative",
                display: "block",
                margin: -12,
                marginTop: 0,
                padding: 4
            }
        },
        {
            name: "doric-panel"
        }
    );
    panelCSS.generate(theme);
    class Panel extends react.Component {
        render() {
            const { children } = this.props;
            return React.createElement("doric-panel", {}, children);
        }
    }
    Panel.title = (props) => {
        const { title, subtitle, image } = props;
        const imageElem =
            image === undefined
                ? undefined
                : React.createElement(Image, {
                      width: 45,
                      height: 45,
                      round: true,
                      source: image
                  });
        return React.createElement(
            "doric-panel-title",
            {},
            imageElem,
            React.createElement("div", {}, title),
            React.createElement("span", {}, subtitle)
        );
    };
    Panel.top = (props) =>
        React.createElement("doric-panel-top", {
            ...props
        });
    Panel.bottom = (props) =>
        React.createElement("doric-panel-bottom", {
            ...props
        });

    const labelCSS = ss(
        {
            "doric-label": {
                display: "block",
                padding: 2,
                color: ({ label }) => label.text.normal,
                fontSize: 12,
                "&.required": {
                    color: ({ label }) => label.text.required
                },
                "&.optional": {
                    color: ({ label }) => label.text.optional
                },
                "&:empty": {
                    display: "none"
                }
            }
        },
        {
            name: "doric-label"
        }
    );
    labelCSS.generate(theme);
    class Label extends react.PureComponent {
        render() {
            const { required, optional, className, ...props } = this.props;
            const _class = classes({
                className: className,
                required: required,
                optional: optional
            });
            return React.createElement("doric-label", {
                ...props,
                class: _class
            });
        }
    }

    const collapseCSS = ss(
        {
            "doric-collapse": {
                display: "block",
                borderRadius: 2,
                overflow: "hidden",
                margin: 4,
                padding: 0,
                border: (theme$$1) => {
                    const {
                        width = 1,
                        type = "solid",
                        color
                    } = theme$$1.collapse.border;
                    return `${width}px ${type} ${color}`;
                },
                "&.hide > div": {
                    display: "none"
                },
                "&-label": {
                    display: "block",
                    padding: 4,
                    fontSize: 16,
                    ...tappable(Color(0, 0, 0, 0.4).toString())
                },
                "&-icon": {
                    display: "inline-block",
                    width: 16,
                    textAlign: "center"
                }
            }
        },
        {
            name: "doric-collapse"
        }
    );
    collapseCSS.generate(theme);
    class Collapse extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                hide: true
            };
            this.toggle = () => {
                const hide = !this.state.hide;
                this.setState({
                    hide: hide
                });
            };
        }
        render() {
            const {
                className,
                label = "Collapse",
                tabIndex = 1,
                children,
                ...passThrough
            } = this.props;
            const { hide } = this.state;
            const _classes = classes({
                className: className,
                hide: hide
            });
            const direction = hide === true ? "right" : "down";
            const icon = React.createElement("doric-collapse-icon", {
                class: `ion-md-arrow-drop${direction}`
            });
            const props = {
                tabIndex: tabIndex,
                ...passThrough
            };
            return React.createElement(
                "doric-collapse",
                {
                    ...props,
                    class: _classes
                },
                React.createElement(
                    "doric-collapse-label",
                    {},
                    icon,
                    label,
                    React.createElement(CustomListeners, {
                        onTap: this.toggle
                    })
                ),
                React.createElement("div", {}, children)
            );
        }
    }

    const checkboxCSS = ss(
        {
            "doric-checkbox": {
                display: "block",
                margin: 2,
                padding: 4,
                ...tappable(Color(0, 0, 0, 0.4).toString()),
                "&.left": {
                    paddingLeft: 24
                },
                "&.right": {
                    paddingRight: 24
                },
                "&-icon": {
                    position: "absolute",
                    display: "flex",
                    top: 0,
                    bottom: 0,
                    width: 24,
                    fontSize: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    "&.left": {
                        left: 0
                    },
                    "&.right": {
                        left: "auto",
                        right: 0
                    }
                }
            }
        },
        {
            name: "doric-checkbox"
        }
    );
    checkboxCSS.generate(theme);
    class Checkbox extends react.PureComponent {
        constructor(props) {
            super(props);
            this.toggle = (event) => {
                var nullref0;

                const { checked } = this.props;
                event.checked = !checked;
                (nullref0 = this.props.onChange) != null
                    ? nullref0(event)
                    : undefined;
            };
        }
        render() {
            const {
                checked,
                checkSide = "left",
                tabIndex = 1,
                text,
                children,
                className,
                ...rest
            } = this.props;
            const iconName = checked === true ? "checkbox" : "square-outline";
            const props = {
                tabIndex: tabIndex,
                class: classes({
                    className: className,
                    [checkSide]: true
                }),
                ...rest
            };
            const iconClass = classes({
                [`ion-md-${iconName}`]: true,
                [checkSide]: true
            });
            return React.createElement(
                "doric-checkbox",
                {
                    ...props
                },
                React.createElement("doric-checkbox-icon", {
                    class: iconClass
                }),
                text,
                children,
                React.createElement(CustomListeners, {
                    onTap: this.toggle
                })
            );
        }
    }

    const inputCSS = ss(
        {
            "doric-input": {
                margin: 2,
                display: "block",
                "& fieldset": {
                    borderRadius: 4,
                    overflow: "hidden",
                    padding: 0,
                    paddingRight: 1,
                    backgroundColor: "white",
                    border: "1px solid lightgray",
                    margin: 0,
                    "&.disabled": {
                        backgroundColor: "lightgray"
                    },
                    "&.boring": {
                        borderWidth: 0
                    },
                    "& legend": {
                        marginLeft: 16,
                        fontSize: 12,
                        "&:empty": {
                            display: "none"
                        },
                        "&:not(:empty) + input": {
                            paddingTop: 6
                        }
                    },
                    "&.required legend": {
                        color: (theme$$1) => theme$$1.input.label.required
                    },
                    "&.optional legend": {
                        color: (theme$$1) => theme$$1.input.label.optional
                    },
                    "&:focus-within": {
                        borderColor: (theme$$1) => theme$$1.input.border.focus
                    }
                },
                "& input": {
                    display: "block",
                    width: "100%",
                    fontSize: 16,
                    padding: 12,
                    borderWidth: 0,
                    backgroundColor: "transparent",
                    height: 40,
                    "&.disabled": {
                        backgroundColor: "transparent"
                    }
                },
                "& fieldset:not(.boring) input": {
                    outline: "none"
                },
                "& fieldset.boring input": {
                    border: "1px solid black",
                    padding: "6px 12px",
                    borderRadius: 4
                }
            }
        },
        {
            name: "doric-input"
        }
    );
    inputCSS.generate(theme);
    class Input extends react.PureComponent {
        render() {
            const {
                label,
                value,
                onChange,
                domRef,
                disabled,
                optional,
                required,
                className,
                boring,
                type = "text",
                wrapProps,
                ...rest
            } = this.props;
            const props = {
                ...rest,
                className: classes({
                    className: className,
                    disabled: disabled,
                    optional: optional,
                    required: required,
                    boring: boring
                })
            };
            return React.createElement(
                "doric-input",
                {
                    ...wrapProps
                },
                React.createElement(
                    "fieldset",
                    {
                        ...props
                    },
                    React.createElement("legend", {}, label),
                    React.createElement("input", {
                        ref: domRef,
                        type: type,
                        disabled: disabled,
                        value: value,
                        onChange: onChange
                    })
                )
            );
        }
    }

    var range = function(a, b) {
        for (
            var c =
                    2 < arguments.length && void 0 !== arguments[2]
                        ? arguments[2]
                        : 1,
                d = [],
                e = a;
            (0 < c && e < b) || (0 > c && e > b);

        )
            d.push(e), (e += c);
        return d;
    };
    const gridSpans = range(0, 12, 1).reduce(
        (spans, i) => ({
            ...spans,
            [`& [gcolspan="${i}"]`]: {
                gridColumn: `span ${i}`
            }
        }),
        {}
    );
    const gridCSS = ss(
        {
            "doric-grid": {
                display: "grid",
                gridGap: 2,
                ...gridSpans,
                "&[clearmargin='true'] > *": {
                    margin: 0
                }
            }
        },
        {
            name: "doric-grid"
        }
    );
    gridCSS.generate(theme);
    class Grid extends react.Component {
        render() {
            const {
                cols = 12,
                vAlign = "start",
                colGap = 0,
                children,
                className,
                ...passThrough
            } = this.props;
            const style = {
                ...passThrough.style,
                gridTemplateColumns: range(0, cols, 1)
                    .map(() => "1fr")
                    .join(" "),
                alignItems: vAlign,
                columnGap: colGap
            };
            const props = {
                ...passThrough,
                class: className,
                style: style
            };
            return React.createElement(
                "doric-grid",
                {
                    ...props
                },
                children
            );
        }
    }

    const selectCSS = ss(
        {
            "doric-select": {
                margin: 2,
                display: "block",
                "& fieldset": {
                    borderRadius: 4,
                    overflow: "hidden",
                    padding: 0,
                    paddingRight: 1,
                    backgroundColor: "white",
                    border: "1px solid lightgray",
                    margin: 0,
                    "&.disabled": {
                        backgroundColor: "lightgray"
                    },
                    "&.boring": {
                        borderWidth: 0
                    },
                    "& legend": {
                        marginLeft: 16,
                        fontSize: 12,
                        "&:empty": {
                            display: "none"
                        },
                        "&:not(:empty) + input": {
                            paddingTop: 6
                        }
                    },
                    "&.required legend": {
                        color: (theme$$1) => theme$$1.input.label.required
                    },
                    "&.optional legend": {
                        color: (theme$$1) => theme$$1.input.label.optional
                    },
                    "&:focus-within": {
                        borderColor: (theme$$1) => theme$$1.input.border.focus
                    }
                },
                "& select": {
                    display: "block",
                    width: "100%",
                    fontSize: 16,
                    padding: "0px 12px",
                    borderWidth: 0,
                    margin: 0,
                    backgroundColor: "transparent",
                    height: 40,
                    "&:focus": {
                        outline: "none"
                    },
                    "&.disabled": {
                        backgroundColor: "transparent"
                    }
                },
                "& fieldset.boring select": {
                    border: "1px solid black",
                    borderRadius: 4
                }
            }
        },
        {
            name: "doric-select"
        }
    );
    selectCSS.generate(theme);
    class Select extends react.Component {
        render() {
            const {
                children,
                selectedIndex = -1,
                value,
                placeholder,
                label,
                className,
                required,
                optional,
                disabled,
                boring,
                onChange,
                wrapProps,
                ...passThrough
            } = this.props;
            const options = React.Children.toArray(children);
            const props = {
                className: classes({
                    className: className,
                    required: required,
                    optional: optional,
                    disabled: disabled,
                    boring: boring
                }),
                ...passThrough
            };
            const selectProps = {
                value:
                    value === undefined
                        ? selectedIndex
                        : options.findIndex((item) => item.props.value === value),
                onChange: (evt) => {
                    var nullref0;

                    evt.value = values[evt.target.value];
                    (nullref0 = onChange) != null ? nullref0(evt) : undefined;
                },
                disabled: disabled
            };
            const list =
                placeholder !== undefined
                    ? [
                          React.createElement(
                              "option",
                              {
                                  key: "-1",
                                  hidden: true,
                                  value: "-1"
                              },
                              placeholder
                          )
                      ]
                    : [];
            const values = [];
            const groups = options
                .reduce(
                    ({ list, current, name }, option, index) => {
                        const { group = "_", value, label } = option.props;
                        const elem = React.createElement(
                            "option",
                            {
                                value: index,
                                key: index
                            },
                            label
                        );
                        if (group !== name) {
                            name = group;
                            if (name === "_") {
                                current = list;
                            } else {
                                current = [name];
                                list.push(current);
                            }
                        }
                        current.push(elem);
                        values.push(value);
                        return {
                            list: list,
                            current: current,
                            name: name
                        };
                    },
                    {
                        list: list,
                        current: null,
                        name: null
                    }
                )
                .list.map((item, index) =>
                    Array.isArray(item) === true
                        ? React.createElement(
                              "optgroup",
                              {
                                  label: item[0],
                                  key: `g${index}`
                              },
                              item.slice(1, undefined)
                          )
                        : item
                );
            return React.createElement(
                "doric-select",
                {
                    ...wrapProps
                },
                React.createElement(
                    "fieldset",
                    {
                        ...props
                    },
                    React.createElement("legend", {}, label),
                    React.createElement(
                        "select",
                        {
                            ...selectProps
                        },
                        groups
                    )
                )
            );
        }
    }

    const listCSS = ss({
        "doric-list": {
            display: "block",
            "& doric-item": {
                display: "block",
                padding: 8,
                borderBottom: "1px solid black",
                ...tappable(Color(0, 0, 0, 0.4).toString())
            },
            "& doric-list-header": {
                position: "sticky",
                display: "block",
                top: 0,
                zIndex: "+10",
                padding: 4,
                fontSize: 16,
                textTransform: "uppercase",
                borderBottom: "1px solid lightgray",
                boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.4)",
                backgroundColor: "white",
                "&:empty": {
                    display: "none"
                }
            }
        }
    });
    listCSS.generate(theme);
    const ListItem = ({ item, propName }) =>
        React.createElement("div", {}, item[propName]);
    class List extends React.PureComponent {
        render() {
            const {
                items,
                label,
                propName = "label",
                onItemTap,
                itemRenderer: ItemRenderer = ListItem,
                ...passThrough
            } = this.props;
            const onTap = (evt) => {
                var nullref0;

                const index = parseInt(evt.target.dataset.index);
                evt.item = items[index];
                (nullref0 = onItemTap) != null ? nullref0(evt) : undefined;
            };
            return React.createElement(
                "doric-list",
                {
                    ...passThrough
                },
                React.createElement("doric-list-header", {}, label),
                React.createElement(
                    "doric-list-content",
                    {},
                    React.createElement(CustomListeners, {
                        onTap: onTap
                    }),
                    items.map((item, index) =>
                        React.createElement(
                            "doric-item",
                            {
                                key: index,
                                "data-index": index
                            },
                            React.createElement(ItemRenderer, {
                                item: item,
                                propName: propName
                            })
                        )
                    )
                )
            );
        }
    }

    const bind = (target, name, desc) => {
        const unbound = desc.value;
        return {
            enumerable: desc.enumerable,
            configurable: true,
            get: function() {
                const bound = unbound.bind(this);
                Object.defineProperty(this, name, {
                    enumerable: desc.enumerable,
                    configurable: false,
                    value: bound
                });
                return bound;
            }
        };
    };

    var bind_1 = bind;

    const dialogCSS = ss(
        {
            "dialog-root": {
                position: "absolute",
                top: 0,
                left: 0
            },
            "dialog-container": {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                "&:empty": {
                    display: "none"
                }
            },
            "dialog-window": {
                backgroundColor: "white",
                border: "1px solid lightgray",
                borderRadius: 4,
                padding: 4,
                overflow: "auto",
                position: "absolute",
                top: "20%",
                left: "50%",
                transform: "translateX(-50%)",
                maxHeight: 480,
                overflow: "hidden",
                "&[fill-space='true']": {
                    width: "75%",
                    height: "50%"
                }
            },
            "@media (max-width: 768px)": {
                "dialog-window": {
                    maxWidth: "75%"
                }
            },
            "@media (min-width: 768px)": {
                "dialog-window": {
                    maxWidth: 640
                }
            },
            "alert-dialog": {
                display: "block",
                minWidth: 150,
                "& alert-title": {
                    display: "flex",
                    borderBottom: "1px solid black",
                    padding: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20
                },
                "& alert-content": {
                    display: "block",
                    textAlign: "center",
                    padding: "12px 0px",
                    "&[wide]": {
                        minWidth: 220
                    },
                    overflow: "auto"
                }
            }
        },
        {
            name: "dialog-css"
        }
    );
    dialogCSS.generate();
    const rootElem = document.createElement("dialog-root");
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () =>
            document.body.appendChild(rootElem)
        );
    } else {
        document.body.appendChild(rootElem);
    }
    class DialogList extends react.Component {
        constructor(props) {
            super(props);
            this.state = {
                dialogs: {}
            };
        }
        render() {
            return Object.values(this.state.dialogs);
        }
    }
    const rootComponent = ReactDOM.render(
        React.createElement(DialogList, {}),
        rootElem
    );
    const AlertDialog = ({ message, title, close }) => {
        const closeHandler = () => close(null);
        return React.createElement(
            "alert-dialog",
            {},
            React.createElement("alert-title", {}, title),
            React.createElement("alert-content", {}, message),
            React.createElement(Button, {
                block: true,
                primary: true,
                flat: true,
                text: "OK",
                onTap: closeHandler
            })
        );
    };
    const ConfirmDialog = ({ message, title, close }) => {
        const okHandle = () => close(true);
        const cancelHandle = () => close(false);
        return React.createElement(
            "alert-dialog",
            {},
            React.createElement("alert-title", {}, title),
            React.createElement(
                "alert-content",
                {
                    wide: true
                },
                message
            ),
            React.createElement(
                Grid,
                {
                    cols: 2
                },
                React.createElement(Button, {
                    block: true,
                    danger: true,
                    flat: true,
                    text: "Cancel",
                    onTap: cancelHandle
                }),
                React.createElement(Button, {
                    block: true,
                    primary: true,
                    flat: true,
                    text: "OK",
                    onTap: okHandle
                })
            )
        );
    };
    class PromptDialog extends react.Component {
        constructor(props) {
            var nullref0;
            super(props);
            this.state = {
                value: (nullref0 = this.props.value) != null ? nullref0 : ``
            };
            this.cancel = () => this.props.close(null);
            this.respond = (evt) => {
                evt.preventDefault();
                this.props.close(this.state.value);
            };
            this.update = (evt) =>
                this.setState({
                    value: evt.target.value
                });
        }
        register(input) {
            this.input = input;
        }
        componentDidMount() {
            return setTimeout(() => this.input.focus(), 0);
        }
        render() {
            const { close, message, title, type } = this.props;
            const { value } = this.state;
            return React.createElement(
                "alert-dialog",
                {},
                React.createElement("alert-title", {}, title),
                React.createElement(
                    "alert-content",
                    {
                        wide: true
                    },
                    message,
                    React.createElement(
                        "form",
                        {
                            onSubmit: this.respond
                        },
                        React.createElement(doric.input, {
                            type: type,
                            domRef: this.register,
                            value: value,
                            onChange: this.update
                        })
                    )
                ),
                React.createElement(
                    Grid,
                    {
                        cols: 2
                    },
                    React.createElement(Button, {
                        block: true,
                        danger: true,
                        flat: true,
                        text: "Cancel",
                        onTap: this.cancel
                    }),
                    React.createElement(Button, {
                        block: true,
                        primary: true,
                        flat: true,
                        text: "OK",
                        onTap: this.respond
                    })
                )
            );
        }
    }
    Object.defineProperty(
        PromptDialog.prototype,
        "register",
        [bind_1].reduceRight(
            (descriptor, decorator) =>
                decorator(PromptDialog.prototype, "register", descriptor),
            Object.getOwnPropertyDescriptor(PromptDialog.prototype, "register")
        )
    );
    const genID = () => Date.now().toString();
    const show = (Component, props = {}, fillSpace = false) =>
        new Promise((resolve) => {
            const id = genID();
            const close = (value) => {
                const { dialogs } = rootComponent.state;
                delete dialogs[id];
                rootComponent.setState({
                    dialogs: dialogs
                });
                resolve(value);
            };
            const tapHandler = (evt) => {
                if (evt.target.tagName.toLowerCase() === "dialog-container") {
                    close(null);
                }
            };
            const { dialogs: current } = rootComponent.state;
            const dialogs = {
                ...current,
                [id]: React.createElement(
                    "dialog-container",
                    {
                        key: id
                    },
                    React.createElement(CustomListeners, {
                        onTap: tapHandler
                    }),
                    React.createElement(
                        "dialog-window",
                        {
                            "fill-space": fillSpace
                        },
                        React.createElement(Component, {
                            close: close,
                            ...props
                        })
                    )
                )
            };
            rootComponent.setState({
                dialogs: dialogs
            });
        });
    var dialog = {
        show: show,
        alert: (message, title = "Alert") =>
            show(AlertDialog, {
                message: message,
                title: title
            }),
        confirm: (message, title = "Confirm") =>
            show(ConfirmDialog, {
                message: message,
                title: title
            }),
        prompt: (value, message, type = "text", title = "Promt") =>
            show(PromptDialog, {
                value: value,
                message: message,
                title: title,
                type: type
            })
    };

    const radioCSS = ss({
        "doric-radio": {
            display: "block",
            "& doric-item": {
                display: "block",
                padding: 8,
                ...tappable(Color(0, 0, 0, 0.4).toString())
            }
        }
    });
    radioCSS.generate(theme);
    class Radio extends react.PureComponent {
        render() {
            const {
                items,
                propName = "label",
                value,
                onItemTap,
                ...passThrough
            } = this.props;
            const onTap = (evt) => {
                var nullref0;

                const index = parseInt(evt.target.dataset.index);
                evt.item = items[index];
                (nullref0 = onItemTap) != null ? nullref0(evt) : undefined;
            };
            return React.createElement(
                "doric-radio",
                {
                    ...passThrough
                },
                React.createElement(CustomListeners, {
                    onTap: onTap
                }),
                items.map((item, index) => {
                    const iconName =
                        item.value === value
                            ? "ion-md-radio-button-on"
                            : "ion-md-radio-button-off";
                    return React.createElement(
                        "doric-item",
                        {
                            key: index,
                            "data-index": index
                        },
                        React.createElement("ion-icon", {
                            class: iconName
                        }),
                        " ",
                        item[propName]
                    );
                })
            );
        }
    }

    const tabCSS = ss(
        {
            "doric-tabs": {
                display: "block",
                "& doric-tab-bar": {
                    display: "block"
                },
                "& doric-tab": {
                    display: "inline-block",
                    padding: "8px 0px",
                    textAlign: "center",
                    borderBottom: "2px solid transparent",
                    ...tappable((theme$$1) => theme$$1.highlightColor),
                    "&[active='true']": {
                        color: (theme$$1) => theme$$1.color.primary,
                        borderBottomColor: (theme$$1) => theme$$1.color.primary
                    }
                }
            }
        },
        {
            name: "doric-tabs"
        }
    );
    tabCSS.generate(theme);
    class Tabs extends React.PureComponent {
        render() {
            const {
                selectedTab = 0,
                cols = 4,
                onTabChange,
                children: _children,
                ...passThrough
            } = this.props;
            const children = React.Children.toArray(_children);
            const list = children.map((child) => child.props.label);
            const displayed = children[selectedTab];
            const tabChange = (evt) => {
                var nullref0;

                const newTab = parseInt(evt.target.dataset.index);
                evt.selectedTab = newTab;
                (nullref0 = onTabChange) != null ? nullref0(evt) : undefined;
            };
            return React.createElement(
                "doric-tabs",
                {
                    ...passThrough
                },
                React.createElement(
                    "doric-tab-bar",
                    {},
                    React.createElement(doric.customListeners, {
                        onTap: tabChange
                    }),
                    React.createElement(
                        Grid,
                        {
                            cols: cols
                        },
                        list.map((label, index) =>
                            React.createElement(
                                "doric-tab",
                                {
                                    key: index,
                                    "data-index": index,
                                    active: index === selectedTab
                                },
                                label
                            )
                        )
                    )
                ),
                displayed
            );
        }
    }
    const Tab = (props) =>
        React.createElement("doric-tab", {
            ...props
        });

    const mainCSS = ss(
        {
            "*": {
                boxSizing: "border-box",
                WebkitTapHighlightColor: "transparent",
                "&:focus": {
                    outline: "none"
                }
            },
            "@media screen and (min-width: 640px)": {
                "*:focus": {
                    outline: (theme$$1) => theme$$1.focusOutline
                }
            },
            "html body": {
                padding: 0,
                margin: 0,
                width: "100%",
                height: "100%",
                fontFamily: "Roboto",
                backgroundColor: "#F0F0F0"
            },
            "div.center": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            },
            "div.fill": {
                width: "100%",
                height: "100%"
            }
        },
        {
            name: "main-style"
        }
    );
    mainCSS.generate(theme);
    var doric$1 = {
        button: Button,
        panel: Panel,
        image: Image,
        label: Label,
        collapse: Collapse,
        checkbox: Checkbox,
        input: Input,
        grid: Grid,
        select: Select,
        list: List,
        customListeners: CustomListeners,
        dialog: dialog,
        radio: Radio,
        tab: Tab,
        tabs: Tabs
    };

    return doric$1;

}(React, ReactDOM));
