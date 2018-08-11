const storage = {
    get(name, defaultValue) {
        const value = localStorage.getItem(name);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value);
    },
    set(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }
};

export default storage;
