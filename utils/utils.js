Number.prototype.to = function (n) {
    const arr = [];

    let current = this + 0;
    while (current < n) {
        arr.push(current);
        current += 1;
    }

    return arr;
};
