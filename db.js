"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdArray = getIdArray;
exports.getAllPropertyProjection = getAllPropertyProjection;
function getIdArray(docs) {
    var ids = [];
    if (!docs)
        return ids;
    for (var i = 0; i < docs.length; i++)
        ids.push(docs[i]._id);
    return ids;
}
function getAllPropertyProjection(doc) {
    doc = Object.assign({}, doc);
    for (var prop in doc) {
        doc[prop] = 1;
    }
    return doc;
}
