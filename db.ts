
export function  getIdArray(docs: any[]) {
    let ids = []
    if (!docs)
        return ids
    for (let i = 0; i < docs.length; i++)
        ids.push(docs[i]._id)
    return ids
}

export function getAllPropertyProjection(doc) {
    doc = Object.assign({}, doc);
    for (let prop in doc)
    {
        doc[prop] = 1;
    }
    return doc
}