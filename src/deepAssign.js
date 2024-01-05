"use strict";
// https://github.com/sindresorhus/deep-assign/blob/master/index.js
Object.defineProperty(exports, "__esModule", { value: true });
var isObj = require('../objects').isObject;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    return Object(val);
}
function assignKey(to, from, key) {
    // TODO replace this by lodash deepCopy() which is more reliable
    var val = from[key];
    if (val === undefined || val === null) {
        return;
    }
    //if (hasOwnProperty.call(to, key)) {
    //if (to[key] === undefined || to[key] === null) {
    //throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
    //to[key] = {}; // some of our config objects are null as default values // only overwrite null if we add a child object
    //}
    //}
    if (!hasOwnProperty.call(to, key) || !isObj(val)) {
        to[key] = val;
    }
    else {
        if (from[key] instanceof Date) // otherwise generates {}
            to[key] = new Date(from[key].getTime());
        else if ((to[key] === undefined || to[key] === null) && (from[key] !== null && from[key] !== undefined))
            to[key] = {};
        /*
        if (key == "lastContact") {
            console.log(from, to)
            process.exit(1)
        }
        */
        else
            to[key] = assign(Object(to[key]), from[key]);
    }
}
function assign(to, from) {
    if (to === from) {
        return to;
    }
    from = Object(from);
    for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
            assignKey(to, from, key);
        }
    }
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
                assignKey(to, from, symbols[i]);
            }
        }
    }
    return to;
}
function deepAssign(target) {
    var from = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        from[_i - 1] = arguments[_i];
    }
    target = toObject(target);
    for (var s = 1; s < arguments.length; s++) {
        assign(target, arguments[s]);
    }
    return target;
}
exports.default = deepAssign;
;
