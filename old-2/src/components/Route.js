import React from 'react';
import autobind from 'autobind-decorator';

const match = (pattern, url, exact = false) => {
    if (pattern === undefined) {
        return {
            url,
            pattern,
            match: undefined,
            params: {}
        };
    }
    if (exact === true) {
        return pattern === url;
    }

    const patternParts = pattern.slice(1).split('/');
    const urlParts = url.slice(1).split('/');

    const match = [];
    const params = {};
    const routeInfo = (matchOverride) => ({
        url,
        pattern,
        match: (matchOverride !== undefined) ? matchOverride : `/${match.join('/')}`,
        params
    });

    let index = 0;
    let keepChecking = true;
    while (keepChecking === true) {
        const patternp = patternParts[index];
        const urlp = urlParts[index];

        switch (true) {
            case (patternp !== undefined && patternp.startsWith("*") === true && urlp !== undefined): {
                const name = patternp.slice(1);
                const value = urlParts.slice(index).join('/');
                params[name] = decodeURI(value);
                return routeInfo(url);
            }
            case (urlp === undefined): {
                if (patternp === undefined) {
                    return routeInfo();
                }
                keepChecking = false;
                break;
            }
            case (patternp === undefined): {
                return routeInfo();
            }
            case (patternp.startsWith(":") === true): {
                const name = patternp.slice(1);
                match.push(urlp);
                params[name] = decodeURI(urlp);
                break;
            }
            case (patternp === "" || urlp === patternp): {
                match.push(urlp);
                break;
            }
            default: {
                return null;
            }
        }

        index += 1;

        if (index > patternParts.length && index > urlParts.length) {
            keepChecking = false;
        }
    }

    return null;
};
const getURL = () => {
    const url = location.hash.toString().slice(1);
    if (url === "") {
        return "/";
    }
    return url;
};

const RouteContext = React.createContext("/");
class Router extends React.Component {
    static push(url) {
        history.pushState({}, "", `#${url}`);
    }
    static pop() {
        history.popState();
    }
    static replace(url) {
        history.replaceState({}, "", `#${url}`);
    }

    constructor(props) {
        super(props);
        this.renderer = () => <React.Fragment>{this.props.children}</React.Fragment>;
        this.state = {url: getURL()};
    }

    @autobind
    componentDidMount() {
        if (this.props.enforce === true) {
            const current = getURL();
            if (current === "") {
                location.hash = "/";
            }
        }
        //  Sadly this is the only way I know of to check the location hash
        //      because of the history.[push|replace|pop]State methods.
        //      Those methods don't trigger hashchange events.
        //  thanks history api :|
        this.interval = setInterval(
            () => {
                const current = getURL();
                if (current !== this.state.url) {
                    this.setState({url: current});
                }
            },
            50
        );
    }
    @autobind
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <RouteContext.Provider value={this.state.url}>
                {this.props.children}
            </RouteContext.Provider>
        );
    }
}
const renderRoute = ({component: Component, path, exact = false, ...props}, url) => {
    const route = match(path, url, exact);

    if (route === null) {
        return null;
    }
    return <Component {...props} route={route} />;
};
const Route = (props) => (
    <RouteContext.Consumer>
        {url => renderRoute(props, url)}
    </RouteContext.Consumer>
);
const RouteSwitch = ({children, pass, container: Container = null, ...props}) => (
    <RouteContext.Consumer>
        {url => {
            children = React.Children.toArray(children);
            const child = (() => {
                for (const child of children) {
                    const render = renderRoute({...pass, ...child.props}, url);
                    if (render !== null) {
                        return render;
                    }
                }
                return null;
            })();
            if (Container !== null) {
                const c = (child === null) ? {} : child;
                const containerProps = Object.keys(props).reduce(
                    (p, key) => {
                        const prop = props[key];
                        if (key.startsWith("eval-") === true) {
                            p[key.slice(5)] = prop(c.props, props);
                        }
                        else {
                            p[key] = prop;
                        }
                        return p;
                    },
                    {}
                );
                const Wrapper = () => child;
                return (
                    <Container {...containerProps}>{child}</Container>
                );
            }
            return child;
        }}
    </RouteContext.Consumer>
);

const Link = ({url, ...props}) => <a {...props} href={`#${url}`} />;

RouteContext.Provider.displayName = "RouteContext";
RouteContext.Consumer.displayName = "RouteConsumer";

export {
    Route,
    RouteSwitch,
    Router,
    Link
};
