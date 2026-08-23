"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChildProcessArgument = addChildProcessArgument;
function addChildProcessArgument(args, key, value) {
    var argsCopy = Object.assign([], args);
    var keyLen = key.length;
    var found = false;
    for (var i = 0; i < argsCopy.length; i++) {
        if (argsCopy[i].substr(0, keyLen) === key) {
            argsCopy[i] = key + "=" + value;
            found = true;
            break;
        }
    }
    if (!found)
        argsCopy.push(key + "=" + value);
    return argsCopy;
}
