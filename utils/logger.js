class Logger {
    static info(message) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }

    static pass(message) {
        console.log(`[PASS] ${new Date().toISOString()} - ${message}`);
    }

    static warn(message) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }

    static error(message, error = null) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);

        if (error) {
            console.error(error);
        }
    }
}

module.exports = { Logger };