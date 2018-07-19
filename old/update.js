const verbs = {
    $set: (prev, value) => value,
    $push: (prev, value) => [...prev, ...value],
    $apply: (prev, value) => value(prev)
};
const checks = {
    $set: (prev, value) => {},
    $push: (prev, value) => {
        if (Array.isArray(prev) === false) {
            throw new Error("Can only push to arrays")
        }
        if (Array.isArray(value) === false) {
            throw new Error("Push value must be an array")
        }
    },
    $apply: (prev, value) => {
        if (typeof value !== 'function') {
            throw new Error("Value must be a function");
        }
    }
};
const internal_copyObject = obj => {
    if (Array.isArray(obj) === true) {
        return [...obj];
    }
    if (typeof obj !== 'object' || obj === null) {
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
    return {...obj};
};
const internal_setValues = (dest, key, n, value) => {
    const name = key[n];
    if (n === (key.length - 1)) {
        checks[name](dest, value);
        return verbs[name](dest, value);
    }
    else {
        dest = internal_copyObject(dest);
        dest[name] = internal_setValues(dest[name], key, n + 1, value);
    }
    return dest;
};
const update = (source, obj) => {
    for (const key of Object.keys(obj)) {
        source = internal_setValues(source, key.split('.'), 0, obj[key]);
    }

    return source;
};
update.addVerb = (verb, method, check) => {
    verbs[verb] = method;
    checks[verb] = check;
};

export default update;
