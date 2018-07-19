export default {
    read(name, defaultValue = null) {
        const value = localStorage.getItem(name);
        if (value === null) {
            return defaultValue;
        }
        return JSON.parse(value);
    },
    write(name, value) {
        localStorage.setItem(name, JSON.stringify(value));
    }
};
