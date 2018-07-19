Number.prototype.to = function (n) {
    const arr = [];

    let current = this + 0;
    while (current < n) {
        arr.push(current);
        current += 1;
    }

    return arr;
};

(() => {
    const transform = code => Babel.transform(
        code,
        {
            presets: ['es2015', 'react', 'stage-0']
        }
    ).code;

    const cache = {};
    const alias = {};
    cache.thing = new Function('exports', transform('export default 10;') + 'return exports;')({});
    const require = name => cache[name];
    const load = async name => {
        if (cache[name] !== undefined) {
            return null;
        }

        const url = (() => {
            if (alias[name] !== undefined) {
                return alias[name];
            }

            return `${name}.js`;
        })();

        const res = await fetch(url);
        if (res.ok === false) {
            throw new Error(`Error loading module '${name}'`);
        }
        return await res.text();
    };

    const run = async (sources, code) => {
        let exports = {};
        const module = {
            get exports() {
                return exports;
            },
            set exports(value) {
                exports = value;
            }
        };

        if (sources.length > 0) {
            for (const source of sources) {
                const dep = await load(source);
                if (dep !== null) {
                    cache[source] = await define(dep);
                }
            }
        }
        new Function('exports', 'require', 'module', code)(exports, require, module);
        return exports;
    };

    const define = code => {
        const es5Code = transform(code);
        const sources = es5Code.match(/\brequire\(.+?\)/g) || [];
        return run(
            sources.map(source => source.match(/require\(.(.+?).\)/)[1]),
            es5Code
        );
    };

    window.runCode = async name => define(await load(name));
    window.setAlias = (name, newName) => {
        if (newName.startsWith("!") === true) {
            cache[name] = window[newName.slice(1)];
            return;
        }

        alias[name] = newName
    };
})();
