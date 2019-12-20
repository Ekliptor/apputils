"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getIdArray(docs) {
    let ids = [];
    if (!docs)
        return ids;
    for (let i = 0; i < docs.length; i++)
        ids.push(docs[i]._id);
    return ids;
}
exports.getIdArray = getIdArray;
function getAllPropertyProjection(doc) {
    doc = Object.assign({}, doc);
    for (let prop in doc) {
        doc[prop] = 1;
    }
    return doc;
}
exports.getAllPropertyProjection = getAllPropertyProjection;
//# sourceMappingURL=db.js.map