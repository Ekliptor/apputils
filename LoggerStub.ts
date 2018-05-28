// stub implementation of https://github.com/winstonjs/winston#using-logging-levels

const logFn = function(params) {
    console.log(params);
}

module.exports = {
    silly: function() {
        logFn(arguments)
    },
    debug: function() {
        logFn(arguments)
    },
    verbose: function() {
        logFn(arguments)
    },
    info: function() {
        logFn(arguments)
    },
    warn: function() {
        logFn(arguments)
    },
    error: function() {
        logFn(arguments)
    },
}