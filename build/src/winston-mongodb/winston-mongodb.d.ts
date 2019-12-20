/**
 * Constructor for the MongoDB transport object.
 * @constructor
 * @param {Object} options
 * @param {string=info} options.level Level of messages that this transport
 * should log.
 * @param {boolean=false} options.silent Boolean flag indicating whether to
 * suppress output.
 * @param {string|Object} options.db MongoDB connection uri or preconnected db
 * object.
 * @param {Object} options.options MongoDB connection parameters
 * (optional, defaults to `{poolSize: 2, autoReconnect: true}`).
 * @param {string=logs} options.collection The name of the collection you want
 * to store log messages in.
 * @param {boolean=false} options.storeHost Boolean indicating if you want to
 * store machine hostname in logs entry, if set to true it populates MongoDB
 * entry with 'hostname' field, which stores os.hostname() value.
 * @param {string} options.label Label stored with entry object if defined.
 * @param {string} options.name Transport instance identifier. Useful if you
 * need to create multiple MongoDB transports.
 * @param {boolean=false} options.capped In case this property is true,
 * winston-mongodb will try to create new log collection as capped.
 * @param {number=10000000} options.cappedSize Size of logs capped collection
 * in bytes.
 * @param {number} options.cappedMax Size of logs capped collection in number
 * of documents.
 * @param {boolean=false} options.tryReconnect Will try to reconnect to the
 * database in case of fail during initialization. Works only if `db` is
 * a string.
 * @param {boolean=false} options.decolorize Will remove color attributes from
 * the log entry message.
 * @param {number} options.expireAfterSeconds Seconds before the entry is removed. Do not use if capped is set.
 */
declare let MongoDB: (options: any) => void;
export { MongoDB };
