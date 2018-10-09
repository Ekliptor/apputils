"use strict";

// nothing to export here. just include this file to extend some objects
// for calling parent http://stackoverflow.com/questions/11854958/how-to-call-a-parent-method-from-child-class-in-javascript
// but we can't overwrite node module functions

export type AggregateCountItem = [string, number];
export interface MergedOrderedObject {
    [key: string]: AggregateCountItem[];
}

// type guard function: http://stackoverflow.com/questions/37543588/typescript-check-if-class-implements-an-interface
/*
export function isAggregateCountItem(arg: any): arg is AggregateCountItem {
    return Array.isArray(arg) && arg.length === 2 && typeof arg[0] === "string" && typeof arg[1] === "number";
}
*/

export type MapToupleArray<V> = [string, V];

String.prototype.replaceAll = function(search, replace) {
    return this.split(search).join(replace)
}

Map.prototype.toObject = function() {
    let obj = Object.create(null)
    //for (let [k,v] of this) // ES6 feature not yet in node 6
        //obj[k] = v // We don’t escape the key '__proto__' which can cause problems on older engines
    let keys = this.keys()
    for (let k of keys)
        obj[k] = this.get(k)
    return obj
}

/**
 * Returns all values of the map as a 1 dimensional array
 * @returns {Array}
 */
Map.prototype.toArray = function() {
    let array = []
    let keys = this.keys()
    for (let k of keys)
        array.push(this.get(k))
    return array
}

/**
 * Returns an array of [key, value] arrays of the map.
 * Useful because both Map and Array preserve the order of keys (but object doesn't).
 * Map can be restored with utils.objects.mapFromToupleArray()
 * @returns {Array}
 */
Map.prototype.toToupleArray = function<V>() {
    let array: MapToupleArray<V>[] = []
    let keys = this.keys()
    for (let k of keys)
        array.push([k, this.get(k)])
    return array
}

Set.prototype.toObject = function() {
    let obj = Object.create(null)
    let keys = this.keys()
    for (let k of keys)
        obj[k] = true // dummy value
    return obj
}

/**
 * Returns all keys of the set as a 1 dimensional array
 * @returns {Array}
 */
Set.prototype.toArray = function() {
    let array = []
    let keys = this.keys()
    for (let k of keys)
        array.push(k)
    return array
}

//Object.prototype.cloneProperties = function() { // causes winston logger to print this always, use utils.cloneObject(), same problem with ALL Object overwites
    //return JSON.parse(JSON.stringify(this))
//}

/**
 * Creates a map with string keys and T values from a JavaScript object.
 * @param object
 * @returns {Map<string, T>}
 */
export function objectToStrMap<T>(object: any) {
    let strMap = new Map<string, T>()
    for (let k of Object.keys(object))
        strMap.set(k, object[k])
    return strMap
}

export function mapFromToupleArray<V>(arr: MapToupleArray<V>[]) {
    return new Map<string, V>(arr) // array is a valid iterator
}

Array.prototype.mathMax = function() {
    return Math.max.apply(null, this) // or Math.min.apply(Math, array)
}

Array.prototype.mathMin = function() {
    return Math.min.apply(null, this)
}

Array.prototype.arrayDiff = function(arr) {
    return this.filter(x => arr.indexOf(x) === -1)
}

Array.prototype.shuffle = function() {
    let a = this
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

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
export function sortByValue(map, ascending = true): AggregateCountItem[] {
    let sortable: AggregateCountItem[] = []
    if (Array.isArray(map) === true)
        sortable = map
    else {
        if (map instanceof Map)
            map = map.toObject();
        for (let key in map)
            sortable.push([key, map[key]]) // create an "associative array", just an array with 2 elements
    }
    if (ascending !== null) {
        sortable.sort((a, b) => {
            if (ascending === true)
                return a[1] - b[1]
            return b[1] - a[1]
        })
    }
    return sortable
}

/**
 * Sort an object by key
 * @param unordered The unordered object
 * @param compareFn (optional) The compare function. Default is ascending alhpabetical ASCII order
 * @returns {{}} the sorted object
 */
export function sortByKey(unordered, compareFn?) {
    // note that object order when enumerating properties is not sable in JS: https://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
    // but stable for nodeJS
    const ordered: any = {};
    Object.keys(unordered).sort(compareFn).forEach(function(key) {
        ordered[key] = unordered[key];
    });
    return ordered;
}

export function getKeyArr(sortedArr) {
    let keyArr = []
    for (let key of sortedArr)
        keyArr.push(key[0])
    return keyArr
}

export function getValueArr(sortedArr) {
    let valArr = []
    for (let key of sortedArr)
        valArr.push(key[1])
    return valArr
}

export function concatInnerArrays(outerArray) {
    let allInner = []
    for (let curInner of outerArray) {
        if (curInner && curInner.length !== 0)
            allInner = allInner.concat(curInner)
    }
    return allInner
}

export function mergeNumberObjects(...objArgs) {
    let merged = {}
    for (let i = 0; i < arguments.length; i++)
    {
        let obj = arguments[i]
        for (let prop in obj)
        {
            if (merged[prop] === undefined)
                merged[prop] = obj[prop]
            else
                merged[prop] += obj[prop]
        }
    }
    return merged
}

/**
 * Merge array-properties of objects which have been created using sortByValue()
 * @param ascending {bool} ascending or descending
 * @param objArgs an object with sorted arrays: {myCounter1: [[key, value], ...], counter2: .... }
 * @returns {object} An object with the ordered arrays as properties (properties just as sortByValue())
 */
export function mergeOrderedArray(ascending = true, ...objArgs): MergedOrderedObject {
    let merged: MergedOrderedObject = {}
    let indexOfInnerArray = (arr, searchKey): number => { // search for a searchKey in [[key, value],...] and return the array-index of the pair
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] && arr[i][0] === searchKey) // better than arr[i].indexOf()
                return i
        }
        return -1
    }
    for (let i = 1; i < arguments.length; i++)
    {
        let obj = arguments[i]
        for (let prop in obj)
        {
            if (merged[prop] === undefined) {
                merged[prop] = obj[prop]
                continue // new property, nothing to merge
            }
            for (let u = 0; u < obj[prop].length; u++)
            {
                let arrValues = obj[prop][u]
                //let index = merged[prop].indexOf(arrValues[0]) // check if the key exists in our ordered array
                let index = indexOfInnerArray(merged[prop], arrValues[0])
                if (index === -1)
                    merged[prop].push(arrValues) // [key, value]
                else
                    merged[prop][index] = [arrValues[0], merged[prop][index][1] + arrValues[1]]
            }
        }
    }
    for (let prop in merged)
    {
        let other: number | AggregateCountItem[] = indexOfInnerArray(merged[prop], 'other')
        let addOther = false
        if (other !== -1) { // remove the aggregated "other"
            other = merged[prop].splice(other, 1) // cache [[key, value]]
            addOther = true
        }
        // sort all values again
        merged[prop] = sortByValue(merged[prop], ascending)

        if (addOther === true)
            merged[prop].push(other[0])
    }
    return merged
}

/**
 * Returns an array of limit elements. The last element in the array called 'other' will be the accumulated count of the remaining elements.
 * @param map An Object or Map to sort by value.
 * @param limit
 * @returns {array}
 */
export function aggregateToLimit(map: any, limit: number): AggregateCountItem[] {
    //let itemCount = Object.keys(map).length // always sort
    let sorted = sortByValue(map, false)
    let count = 0
    let aggregate: AggregateCountItem[] = []
    let otherValue = 0
    let addOther = false
    for (let item of sorted)
    {
        count++
        if (count < limit)
            aggregate.push(item)
        else {
            otherValue += item[1]
            addOther = true
        }
    }
    if (addOther === true)
        aggregate.push(['other', otherValue])
    return aggregate
}

export function getUniqueResults<T>(resultArr: T[], uniqueProp: string, propFilterFn: (itemProp: any) => any): T[] {
    let filter = new Map<string, T>() // map guarantess key order: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
    if (typeof propFilterFn !== 'function') {
        propFilterFn = (prop) => {
            return prop // just return it unmodified
        }
    }
    for (let i = 0; i < resultArr.length; i++)
    {
        if (filter.has(resultArr[i][uniqueProp]) === true)
            continue
        let prop = propFilterFn(resultArr[i][uniqueProp])
        filter.set(prop, resultArr[i])
    }
    resultArr = Array.from(filter.values())
    // not allowed with target ES5: https://github.com/Microsoft/TypeScript/issues/3164#issuecomment-104443321
    //for (let result of filter.values())
        //resultArr.push(result)
    return resultArr
}

export function isObject (x) {
    // https://github.com/sindresorhus/is-obj/blob/master/index.js
    let type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
}

/**
 * Counts how often each value is present in the array
 * @param arr
 * @return a map with the array value as key and the number of occurrences as value
 */
export function countArrayValues(arr: string[]): Map<string, number> {
    let count = new Map<string, number>();
    arr.forEach((el) => {
        let c = count.get(el)
        if (!c)
            c = 1;
        else
            c++;
        count.set(el, c)
    })
    return count
}

/**
 * Generate all n! permutations of all elements in a[].
 * // https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * For example to get all permutations of the string "xyz":
 * Array.from<string[]>(utils.objects.permute("xyz".split(''))).map(perm => perm.join(''));
 * @param a
 * @param n
 */
export function *permute(a: any[], n = a.length) {
    if (n <= 1) {
        yield a.slice(); // copy it
    }
    else {
        // generate (n−1)! permutations of the first n-1 elements
        for (let i = 0; i < n; i++)
        {
            yield *permute(a, n - 1);
            const j = n % 2 ? 0 : i;
            [a[n-1], a[j]] = [a[j], a[n-1]];
        }
    }
}

/**
 * Returns the cartesian product of all elements in the inner arrays.
 * example call: utils.objects.cartesianProduct(["ab".split(""), "xy".split("")]);
 * https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
 * @param arrOfArrays
 */
export function cartesianProduct(arrOfArrays: any[][]): any[][]
{
    return arrOfArrays.reduce((a,b) => {
        return a.map((x) => {
            return b.map((y) => {
                return x.concat(y);
            })
        }).reduce((a,b) => { return a.concat(b) },[])
    }, [[]])
}

export function removeElasticsearchProperties(doc) {
    delete doc._source
    delete doc._index
    delete doc._type
    delete doc._score
    return doc
}

export function isEmpty(obj: any) {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name === "constructor")
                return; // we can't override it (only the real class constructor gets called). so don't override the prototype to keep the class name too
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

/**
 * Creates an array with length elements which all contain value.
 * @param value
 * @param length
 */
export function fillCreateArray<T>(value: T, length: number): T[] {
    let arr: T[] = [];
    for (let i = 0; i < length; i++)
        arr.push(value);
    return arr;
}

/**
 * Returns a plain object (not nested object) from an array of objects.
 * Plain object keys will be named: keyPrefix + index in original array + original key
 * @param arr the array to unpack
 * @param keyPrefix
 */
export function getPlainArrayData(arr: any[], keyPrefix = "arr_") {
    let plain: any = {}
    for (let i = 0; i < arr.length; i++)
    {
        let cur = arr[i];
        for (let key in cur)
            plain[keyPrefix + i + "_" + key] = cur[key];
    }
    return plain;
}

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

import deepAssign from "./src/deepAssign";
export {deepAssign};