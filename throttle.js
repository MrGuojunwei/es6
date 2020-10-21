function throttle(fn, wait) {
    wait = wait || 500;
    let timer = null,
        previous = 0;
    return function proxy(...args) {
        let now = new Date(),
            remaining = wait - (now - previous);
        if (remaining <= 0) {
            previous = now;
            fn.call(this, ...args);
        } else if (!timer) {
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
                previous = now;
                fn.call(this, ...args);
            }, remaining)
        }
    }
}