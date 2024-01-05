"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepAssign = exports.getdObjectValues = exports.getIndexedObjectValues = exports.isSameElementArray = exports.getPlainArrayData = exports.fillCreateArray = exports.applyMixins = exports.isEmpty = exports.removeElasticsearchProperties = exports.cartesianProduct = exports.permute = exports.countArrayValues = exports.isObject = exports.getUniqueResults = exports.aggregateToLimit = exports.mergeOrderedArray = exports.mergeNumberObjects = exports.concatInnerArrays = exports.getValueArr = exports.getKeyArr = exports.sortByKey = exports.sortByValue = exports.mapFromToupleArray = exports.getFirstKey = exports.objectToStrMap = exports.OBJECT_OVERWRITES = void 0;
// nothing to export here. just include this file to extend some objects
// for calling parent http://stackoverflow.com/questions/11854958/how-to-call-a-parent-method-from-child-class-in-javascript
// but we can't overwrite node module functions
exports.OBJECT_OVERWRITES = ["mathMax", "mathMin", "arrayDiff", "shuffle"];
String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
};
/**
 * Serialize the Map to a plain JavaScript object preserving key-value pairs (and order in NodejS/v8).
 * This function can be used to serialize nested maps recursively.
 * @returns {Object}
 */
Map.prototype.toObject = function () {
    var obj = Object.create(null);
    //for (let [k,v] of this) // ES6 feature not yet in node 6
    //obj[k] = v // We don’t escape the key '__proto__' which can cause problems on older engines
    var keys = this.keys();
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var k = keys_1[_i];
        var value = this.get(k);
        if (value instanceof Map)
            value = value.toObject();
        obj[k] = value;
    }
    return obj;
};
/**
 * Returns all values of the map as a 1 dimensional array.
 * For nested maps this function will insert a single array with all the values of the nested map into the parent array.
 * @returns {Array}
 */
Map.prototype.toArray = function () {
    var array = [];
    var keys = this.keys();
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
        var k = keys_2[_i];
        var value = this.get(k);
        if (value instanceof Map)
            value = value.toArray();
        array.push(value);
    }
    return array;
};
/**
 * Returns an array of [key, value] arrays of the map.
 * Useful because both Map and Array preserve the order of keys (but object doesn't).
 * Map can be restored with utils.objects.mapFromToupleArray()
 * This function can be used to serialize nested maps recursively.
 * @returns {Array}
 */
Map.prototype.toToupleArray = function () {
    var array = [];
    var keys = this.keys();
    for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
        var k = keys_3[_i];
        //array.push([k, this.get(k)])
        var value = this.get(k);
        if (value instanceof Map)
            value = value.toToupleArray();
        array.push([k, value]);
    }
    return array;
};
Set.prototype.toObject = function () {
    var obj = Object.create(null);
    var keys = this.keys();
    for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
        var k = keys_4[_i];
        obj[k] = true;
    } // dummy value
    return obj;
};
/**
 * Returns all keys of the set as a 1 dimensional array
 * @returns {Array}
 */
Set.prototype.toArray = function () {
    var array = [];
    var keys = this.keys();
    for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
        var k = keys_5[_i];
        array.push(k);
    }
    return array;
};
//Object.prototype.cloneProperties = function() { // causes winston logger to print this always, use utils.cloneObject(), same problem with ALL Object overwites
//return JSON.parse(JSON.stringify(this))
//}
/**
 * Creates a map with string keys and T values from a JavaScript object.
 * @param object
 * @returns {Map<string, T>}
 */
function objectToStrMap(object) {
    var strMap = new Map();
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var k = _a[_i];
        strMap.set(k, object[k]);
    }
    return strMap;
}
exports.objectToStrMap = objectToStrMap;
/**
 * Return the first key of an object.
 * @param object
 */
function getFirstKey(object) {
    for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
        var k = _a[_i];
        return k;
    }
    return null;
}
exports.getFirstKey = getFirstKey;
/**
 * Restore a map which has been serialized using toToupleArray().
 * For nested maps this function will only restore the root map entries.
 * @param arr
 */
function mapFromToupleArray(arr) {
    // TODO restore nested maps. Since we don't know the class of child maps this requires a factory function.
    // Might be simpler to just unserialize those maps in their constructor.
    return new Map(arr); // array is a valid iterator
}
exports.mapFromToupleArray = mapFromToupleArray;
Array.prototype.mathMax = function () {
    return Math.max.apply(null, this); // or Math.min.apply(Math, array)
};
Array.prototype.mathMin = function () {
    return Math.min.apply(null, this);
};
Array.prototype.arrayDiff = function (arr) {
    return this.filter(function (x) { return arr.indexOf(x) === -1; });
};
Array.prototype.shuffle = function () {
    var _a;
    var a = this;
    for (var i = a.length; i; i--) {
        var j = Math.floor(Math.random() * i);
        _a = [a[j], a[i - 1]], a[i - 1] = _a[0], a[j] = _a[1];
    }
};
// inspired by Meteors EJSON: https://docs.meteor.com/api/ejson.html
// we want to keep the timezone of the date, so we can unserialize it in a different timezone
// NPM port: https://www.npmjs.com/package/ejson
/*
Date.prototype.toJSON = function() {
    // function MUST return a string, otherwise we could skip the stringify and avoid double-quotes
    return JSON.stringify({$date: this.getTime()});
}
*/
/**
 *
 * @param map An Object or Map to sort by value. Can also be an array [[key, value],...]
 * @param ascending true = ascending, false = descending, null = no sorting (useful to implement custom sorting)
 * @returns {Array} An array of array with ("associative array"). Use innerArray[0] for key and innerArray[1] for the object value
 * Note that it is unsafe to convert the result back to object since the order of properties is not guaranteed in JavaScript
 */
function sortByValue(map, ascending) {
    if (ascending === void 0) { ascending = true; }
    var sortable = [];
    if (Array.isArray(map) === true)
        sortable = map;
    else {
        if (map instanceof Map)
            map = map.toObject();
        for (var key in map)
            sortable.push([key, map[key]]); // create an "associative array", just an array with 2 elements
    }
    if (ascending !== null) {
        sortable.sort(function (a, b) {
            if (ascending === true)
                return a[1] - b[1];
            return b[1] - a[1];
        });
    }
    return sortable;
}
exports.sortByValue = sortByValue;
/**
 * Sort an object by key
 * @param unordered The unordered object
 * @param compareFn (optional) The compare function. Default is ascending alhpabetical ASCII order
 * @returns {{}} the sorted object
 */
function sortByKey(unordered, compareFn) {
    // note that object order when enumerating properties is not sable in JS: https://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
    // but stable for nodeJS
    if (unordered instanceof Map)
        unordered = unordered.toObject();
    var ordered = {};
    Object.keys(unordered).sort(compareFn).forEach(function (key) {
        ordered[key] = unordered[key];
    });
    return ordered;
}
exports.sortByKey = sortByKey;
function getKeyArr(sortedArr) {
    var keyArr = [];
    for (var _i = 0, sortedArr_1 = sortedArr; _i < sortedArr_1.length; _i++) {
        var key = sortedArr_1[_i];
        keyArr.push(key[0]);
    }
    return keyArr;
}
exports.getKeyArr = getKeyArr;
function getValueArr(sortedArr) {
    var valArr = [];
    for (var _i = 0, sortedArr_2 = sortedArr; _i < sortedArr_2.length; _i++) {
        var key = sortedArr_2[_i];
        valArr.push(key[1]);
    }
    return valArr;
}
exports.getValueArr = getValueArr;
function concatInnerArrays(outerArray) {
    var allInner = [];
    for (var _i = 0, outerArray_1 = outerArray; _i < outerArray_1.length; _i++) {
        var curInner = outerArray_1[_i];
        if (curInner && curInner.length !== 0)
            allInner = allInner.concat(curInner);
    }
    return allInner;
}
exports.concatInnerArrays = concatInnerArrays;
function mergeNumberObjects() {
    var objArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objArgs[_i] = arguments[_i];
    }
    var merged = {};
    for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var prop in obj) {
            if (merged[prop] === undefined)
                merged[prop] = obj[prop];
            else
                merged[prop] += obj[prop];
        }
    }
    return merged;
}
exports.mergeNumberObjects = mergeNumberObjects;
/**
 * Merge array-properties of objects which have been created using sortByValue()
 * @param ascending {bool} ascending or descending
 * @param objArgs an object with sorted arrays: {myCounter1: [[key, value], ...], counter2: .... }
 * @returns {object} An object with the ordered arrays as properties (properties just as sortByValue())
 */
function mergeOrderedArray(ascending) {
    if (ascending === void 0) { ascending = true; }
    var objArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objArgs[_i - 1] = arguments[_i];
    }
    var merged = {};
    var indexOfInnerArray = function (arr, searchKey) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i][0] === searchKey) // better than arr[i].indexOf()
                return i;
        }
        return -1;
    };
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        for (var prop in obj) {
            if (merged[prop] === undefined) {
                merged[prop] = obj[prop];
                continue; // new property, nothing to merge
            }
            for (var u = 0; u < obj[prop].length; u++) {
                var arrValues = obj[prop][u];
                //let index = merged[prop].indexOf(arrValues[0]) // check if the key exists in our ordered array
                var index = indexOfInnerArray(merged[prop], arrValues[0]);
                if (index === -1)
                    merged[prop].push(arrValues); // [key, value]
                else
                    merged[prop][index] = [arrValues[0], merged[prop][index][1] + arrValues[1]];
            }
        }
    }
    for (var prop in merged) {
        var other = indexOfInnerArray(merged[prop], 'other');
        var addOther = false;
        if (other !== -1) { // remove the aggregated "other"
            other = merged[prop].splice(other, 1); // cache [[key, value]]
            addOther = true;
        }
        // sort all values again
        merged[prop] = sortByValue(merged[prop], ascending);
        if (addOther === true)
            merged[prop].push(other[0]);
    }
    return merged;
}
exports.mergeOrderedArray = mergeOrderedArray;
/**
 * Returns an array of limit elements. The last element in the array called 'other' will be the accumulated count of the remaining elements.
 * @param map An Object or Map to sort by value.
 * @param limit
 * @returns {array}
 */
function aggregateToLimit(map, limit) {
    //let itemCount = Object.keys(map).length // always sort
    var sorted = sortByValue(map, false);
    var count = 0;
    var aggregate = [];
    var otherValue = 0;
    var addOther = false;
    for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
        var item = sorted_1[_i];
        count++;
        if (count < limit)
            aggregate.push(item);
        else {
            otherValue += item[1];
            addOther = true;
        }
    }
    if (addOther === true)
        aggregate.push(['other', otherValue]);
    return aggregate;
}
exports.aggregateToLimit = aggregateToLimit;
function getUniqueResults(resultArr, uniqueProp, propFilterFn) {
    var filter = new Map(); // map guarantess key order: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
    if (typeof propFilterFn !== 'function') {
        propFilterFn = function (prop) {
            return prop; // just return it unmodified
        };
    }
    for (var i = 0; i < resultArr.length; i++) {
        if (filter.has(resultArr[i][uniqueProp]) === true)
            continue;
        var prop = propFilterFn(resultArr[i][uniqueProp]);
        filter.set(prop, resultArr[i]);
    }
    resultArr = Array.from(filter.values());
    // not allowed with target ES5: https://github.com/Microsoft/TypeScript/issues/3164#issuecomment-104443321
    //for (let result of filter.values())
    //resultArr.push(result)
    return resultArr;
}
exports.getUniqueResults = getUniqueResults;
function isObject(x) {
    // https://github.com/sindresorhus/is-obj/blob/master/index.js
    var type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
}
exports.isObject = isObject;
/**
 * Counts how often each value is present in the array
 * @param arr
 * @return a map with the array value as key and the number of occurrences as value
 */
function countArrayValues(arr) {
    var count = new Map();
    arr.forEach(function (el) {
        var c = count.get(el);
        if (!c)
            c = 1;
        else
            c++;
        count.set(el, c);
    });
    return count;
}
exports.countArrayValues = countArrayValues;
/**
 * Generate all n! permutations of all elements in a[].
 * // https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * For example to get all permutations of the string "xyz":
 * Array.from<string[]>(utils.objects.permute("xyz".split(''))).map(perm => perm.join(''));
 * @param a
 * @param n
 */
function permute(a, n) {
    var i, j;
    var _a;
    if (n === void 0) { n = a.length; }
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(n <= 1)) return [3 /*break*/, 2];
                return [4 /*yield*/, a.slice()];
            case 1:
                _b.sent(); // copy it
                return [3 /*break*/, 6];
            case 2:
                i = 0;
                _b.label = 3;
            case 3:
                if (!(i < n)) return [3 /*break*/, 6];
                return [5 /*yield**/, __values(permute(a, n - 1))];
            case 4:
                _b.sent();
                j = n % 2 ? 0 : i;
                _a = [a[j], a[n - 1]], a[n - 1] = _a[0], a[j] = _a[1];
                _b.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/];
        }
    });
}
exports.permute = permute;
/**
 * Returns the cartesian product of all elements in the inner arrays.
 * example call: utils.objects.cartesianProduct(["ab".split(""), "xy".split("")]);
 * https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
 * @param arrOfArrays
 */
function cartesianProduct(arrOfArrays) {
    return arrOfArrays.reduce(function (a, b) {
        return a.map(function (x) {
            return b.map(function (y) {
                return x.concat(y);
            });
        }).reduce(function (a, b) { return a.concat(b); }, []);
    }, [[]]);
}
exports.cartesianProduct = cartesianProduct;
function removeElasticsearchProperties(doc) {
    delete doc._source;
    delete doc._index;
    delete doc._type;
    delete doc._score;
    return doc;
}
exports.removeElasticsearchProperties = removeElasticsearchProperties;
function isEmpty(obj) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
exports.isEmpty = isEmpty;
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            if (name === "constructor")
                return; // we can't override it (only the real class constructor gets called). so don't override the prototype to keep the class name too
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
exports.applyMixins = applyMixins;
/**
 * Creates an array with length elements which all contain value.
 * @param value
 * @param length
 */
function fillCreateArray(value, length) {
    var arr = [];
    for (var i = 0; i < length; i++)
        arr.push(value);
    return arr;
}
exports.fillCreateArray = fillCreateArray;
/**
 * Returns a plain object (not nested object) from an array of objects.
 * Plain object keys will be named: keyPrefix + index in original array + original key
 * @param arr the array to unpack
 * @param keyPrefix
 */
function getPlainArrayData(arr, keyPrefix) {
    if (keyPrefix === void 0) { keyPrefix = "arr_"; }
    var plain = {};
    for (var i = 0; i < arr.length; i++) {
        var cur = arr[i];
        for (var key in cur)
            plain[keyPrefix + i + "_" + key] = cur[key];
    }
    return plain;
}
exports.getPlainArrayData = getPlainArrayData;
/**
 * Checks if the arrays contain the same elements in the same order (by reference), so they are identical.
 * @param arr1
 * @param arr2
 */
function isSameElementArray(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = 0; i < arr1.length && i < arr2.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
exports.isSameElementArray = isSameElementArray;
/**
 * Returns the values of an object as a plain array.
 * Values may be null/undefined.
 * This function is useful to values from an object such as MongoDB result.insertedIds:
 * http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~insertWriteOpResult
 * @param obj
 */
function getIndexedObjectValues(obj) {
    return Object.entries(obj).map(function (o) { return o[1]; });
}
exports.getIndexedObjectValues = getIndexedObjectValues;
/**
 * Returns the values of an object as a plain array.
 * Values may be null/undefined.
 * @param obj
 */
function getdObjectValues(obj) {
    return Object.entries(obj).map(function (o) { return o[1]; });
}
exports.getdObjectValues = getdObjectValues;
/* // promises will always get executed. only results will be in the order supplied here. only possible with an array of functions (see async library)
export function promiseAllSequence<T>(promises: Promise<T>[]) {
    return new Promise<T[]> ((resolve, reject) => {
        let sequence = Promise.resolve();
        let results: T[] = [];
        promises.forEach((promise) => {
            // Chain one computation onto the sequence
            sequence = sequence.then(() => {
                return promise;
            }).then((result) => {
                results.push(result); // Resolves for each file, one at a time.
                if (results.length === promises.length)
                    resolve(results);
            }).catch((err) => {
                reject(err);
            });
        })
    })
}
*/
var deepAssign_1 = require("./src/deepAssign");
exports.deepAssign = deepAssign_1.default;
