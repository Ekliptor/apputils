export declare const OBJECT_OVERWRITES: string[];
export declare type AggregateCountItem = [string, number];
export interface MergedOrderedObject {
    [key: string]: AggregateCountItem[];
}
export declare type MapToupleArray<V> = [string, V];
/**
 * Creates a map with string keys and T values from a JavaScript object.
 * @param object
 * @returns {Map<string, T>}
 */
export declare function objectToStrMap<T>(object: any): Map<string, T>;
/**
 * Return the first key of an object.
 * @param object
 */
export declare function getFirstKey(object: any): string;
/**
 * Restore a map which has been serialized using toToupleArray().
 * For nested maps this function will only restore the root map entries.
 * @param arr
 */
export declare function mapFromToupleArray<V>(arr: MapToupleArray<V>[]): Map<string, V>;
/**
 *
 * @param map An Object or Map to sort by value. Can also be an array [[key, value],...]
 * @param ascending true = ascending, false = descending, null = no sorting (useful to implement custom sorting)
 * @returns {Array} An array of array with ("associative array"). Use innerArray[0] for key and innerArray[1] for the object value
 * Note that it is unsafe to convert the result back to object since the order of properties is not guaranteed in JavaScript
 */
export declare function sortByValue(map: any, ascending?: boolean): AggregateCountItem[];
/**
 * Sort an object by key
 * @param unordered The unordered object
 * @param compareFn (optional) The compare function. Default is ascending alhpabetical ASCII order
 * @returns {{}} the sorted object
 */
export declare function sortByKey(unordered: any, compareFn?: any): any;
export declare function getKeyArr(sortedArr: any): any[];
export declare function getValueArr(sortedArr: any): any[];
export declare function concatInnerArrays(outerArray: any): any[];
export declare function mergeNumberObjects(...objArgs: any[]): {};
/**
 * Merge array-properties of objects which have been created using sortByValue()
 * @param ascending {bool} ascending or descending
 * @param objArgs an object with sorted arrays: {myCounter1: [[key, value], ...], counter2: .... }
 * @returns {object} An object with the ordered arrays as properties (properties just as sortByValue())
 */
export declare function mergeOrderedArray(ascending?: boolean, ...objArgs: any[]): MergedOrderedObject;
/**
 * Returns an array of limit elements. The last element in the array called 'other' will be the accumulated count of the remaining elements.
 * @param map An Object or Map to sort by value.
 * @param limit
 * @returns {array}
 */
export declare function aggregateToLimit(map: any, limit: number): AggregateCountItem[];
export declare function getUniqueResults<T>(resultArr: T[], uniqueProp: string, propFilterFn?: (itemProp: any) => any): T[];
export declare function isObject(x: any): boolean;
/**
 * Counts how often each value is present in the array
 * @param arr
 * @return a map with the array value as key and the number of occurrences as value
 */
export declare function countArrayValues(arr: string[]): Map<string, number>;
/**
 * Generate all n! permutations of all elements in a[].
 * // https://en.wikipedia.org/wiki/Heap%27s_algorithm
 * For example to get all permutations of the string "xyz":
 * Array.from<string[]>(utils.objects.permute("xyz".split(''))).map(perm => perm.join(''));
 * @param a
 * @param n
 */
export declare function permute(a: any[], n?: number): any;
/**
 * Returns the cartesian product of all elements in the inner arrays.
 * example call: utils.objects.cartesianProduct(["ab".split(""), "xy".split("")]);
 * https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
 * @param arrOfArrays
 */
export declare function cartesianProduct(arrOfArrays: any[][]): any[][];
export declare function removeElasticsearchProperties(doc: any): any;
export declare function isEmpty(obj: any): boolean;
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
/**
 * Creates an array with length elements which all contain value.
 * @param value
 * @param length
 */
export declare function fillCreateArray<T>(value: T, length: number): T[];
/**
 * Returns a plain object (not nested object) from an array of objects.
 * Plain object keys will be named: keyPrefix + index in original array + original key
 * @param arr the array to unpack
 * @param keyPrefix
 */
export declare function getPlainArrayData(arr: any[], keyPrefix?: string): any;
/**
 * Checks if the arrays contain the same elements in the same order (by reference), so they are identical.
 * @param arr1
 * @param arr2
 */
export declare function isSameElementArray(arr1: any[], arr2: any[]): boolean;
/**
 * Returns the values of an object as a plain array.
 * Values may be null/undefined.
 * This function is useful to values from an object such as MongoDB result.insertedIds:
 * http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~insertWriteOpResult
 * @param obj
 */
export declare function getIndexedObjectValues<V>(obj: {
    [key: number]: any;
}): V[];
/**
 * Returns the values of an object as a plain array.
 * Values may be null/undefined.
 * @param obj
 */
export declare function getdObjectValues<V>(obj: {
    [key: string]: any;
}): V[];
import deepAssign from "./src/deepAssign";
export { deepAssign };
