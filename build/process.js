"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChildProcessArgument = addChildProcessArgument;
function addChildProcessArgument(args, key, value) {
    let argsCopy = Object.assign([], args);
    let keyLen = key.length;
    let found = false;
    for (let i = 0; i < argsCopy.length; i++) {
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
//# sourceMappingURL=process.js.map