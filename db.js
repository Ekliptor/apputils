"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertyProjection = exports.getIdArray = void 0;
function getIdArray(docs) {
    var ids = [];
    if (!docs)
        return ids;
    for (var i = 0; i < docs.length; i++)
        ids.push(docs[i]._id);
    return ids;
}
exports.getIdArray = getIdArray;
function getAllPropertyProjection(doc) {
    doc = Object.assign({}, doc);
    for (var prop in doc) {
        doc[prop] = 1;
    }
    return doc;
}
exports.getAllPropertyProjection = getAllPropertyProjection;
