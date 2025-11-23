"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIdArray = getIdArray;
exports.getAllPropertyProjection = getAllPropertyProjection;
function getIdArray(docs) {
    let ids = [];
    if (!docs)
        return ids;
    for (let i = 0; i < docs.length; i++)
        ids.push(docs[i]._id);
    return ids;
}
function getAllPropertyProjection(doc) {
    doc = Object.assign({}, doc);
    for (let prop in doc) {
        doc[prop] = 1;
    }
    return doc;
}
//# sourceMappingURL=db.js.map