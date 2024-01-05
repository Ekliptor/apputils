/**
 * @module 'winston-mongodb'
 * @fileoverview Winston transport for logging into MongoDB
 * @license MIT
 * @author charlie@nodejitsu.com (Charlie Robbins)
 * @author 0@39.yt (Yurij Mikhalevich)
 */
'use strict';
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDB = void 0;
var util = require('util');
var os = require('os');
var _a = require('triple-beam'), LEVEL = _a.LEVEL, MESSAGE = _a.MESSAGE;
var mongodb = require('mongodb');
var winston = require('winston');
var Stream = require('stream').Stream;
var helpers = require('./helpers');
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
var MongoDB = exports.MongoDB = function (options) {
    winston.Transport.call(this, options);
    options = (options || {});
    if (!options.db) {
        throw new Error('You should provide db to log to.');
    }
    this.name = options.name || 'mongodb';
    this.db = options.db;
    this.options = options.options;
    if (!this.options) {
        this.options = {
            poolSize: 2,
            autoReconnect: true
        };
    }
    this.collection = (options.collection || 'log');
    this.level = (options.level || 'info');
    this.silent = options.silent;
    this.storeHost = options.storeHost;
    this.label = options.label;
    this.capped = options.capped;
    this.cappedSize = (options.cappedSize || 10000000);
    this.cappedMax = options.cappedMax;
    this.decolorize = options.decolorize;
    this.expireAfterSeconds = !this.capped && options.expireAfterSeconds;
    if (this.storeHost) {
        this.hostname = os.hostname();
    }
    this._opQueue = [];
    var self = this;
    function setupDatabaseAndEmptyQueue(db) {
        return createCollection(db).then(function (db) {
            self.logDb = db;
            processOpQueue();
        }, function (err) {
            db.close();
            console.error('winston-mongodb, initialization error: ', err);
        });
    }
    function processOpQueue() {
        self._opQueue.forEach(function (operation) {
            return self[operation.method].apply(self, operation.args);
        });
        delete self._opQueue;
    }
    function createCollection(db) {
        var opts = self.capped ?
            { capped: true, size: self.cappedSize, max: self.cappedMax } : {};
        return db.createCollection(self.collection, opts).then(function (col) {
            var ttlIndexName = 'timestamp_1';
            var indexOpts = { name: ttlIndexName, background: true };
            if (self.expireAfterSeconds) {
                indexOpts.expireAfterSeconds = self.expireAfterSeconds;
            }
            return col.indexInformation({ full: true }).then(function (info) {
                info = info.filter(function (i) { return i.name === ttlIndexName; });
                if (info.length === 0) { // if its a new index then create it
                    return col.createIndex({ timestamp: -1 }, indexOpts);
                }
                else { // if index existed with the same name check if expireAfterSeconds param has changed
                    if (info[0].expireAfterSeconds !== undefined &&
                        info[0].expireAfterSeconds !== self.expireAfterSeconds) {
                        return col.dropIndex(ttlIndexName)
                            .then(function () { return col.createIndex({ timestamp: -1 }, indexOpts); });
                    }
                }
            });
        }).then(function () { return db; });
    }
    function connectToDatabase(logger) {
        return mongodb.MongoClient.connect(logger.db, logger.options).then(setupDatabaseAndEmptyQueue, function (err) {
            console.error('winston-mongodb: error initialising logger', err);
            if (options.tryReconnect) {
                console.log('winston-mongodb: will try reconnecting in 10 seconds');
                return new Promise(function (resolve) { return setTimeout(resolve, 10000); }).then(function () { return connectToDatabase(logger); });
            }
        });
    }
    if ('string' === typeof this.db) {
        connectToDatabase(this);
    }
    else if ('function' === typeof this.db.then) {
        this.db.then(setupDatabaseAndEmptyQueue, function (err) { return console.error('winston-mongodb: error initialising logger from promise', err); });
    }
    else { // preconnected object
        setupDatabaseAndEmptyQueue(this.db);
    }
};
exports.MongoDB = MongoDB;
/**
 * Inherit from `winston.Transport`.
 */
util.inherits(MongoDB, winston.Transport);
/**
 * Define a getter so that `winston.transports.MongoDB`
 * is available and thus backwards compatible.
 */
winston.transports.MongoDB = MongoDB;
/**
 * Closes MongoDB connection so using process would not hang up.
 * Used by winston Logger.close on transports.
 */
MongoDB.prototype.close = function () {
    var _this = this;
    if (!this.logDb) {
        return;
    }
    this.logDb.close().then(function () { return _this.logDb = null; }).catch(function (err) {
        console.error('Winston MongoDB transport encountered on error during '
            + 'closing.', err);
    });
};
/**
 * Core logging method exposed to Winston. Metadata is optional.
 * @param {Object} info Logging metadata
 * @param {Function} cb Continuation to respond to when complete.
 */
//Ekliptor> fix
//MongoDB.prototype.log = function(info, cb) {
MongoDB.prototype.log = function (level, msg, meta, cb) {
    var _this = this;
    var info = {
        //LEVEL: level,
        //MESSAGE: msg,
        meta: meta
    };
    info[Symbol.for('level')] = level;
    info[Symbol.for('message')] = msg;
    //Ekliptor< fix
    if (!this.logDb) {
        this._opQueue.push({ method: 'log', args: arguments });
        return true;
    }
    if (!cb) {
        cb = function () { };
    }
    // Avoid reentrancy that can be not assumed by database code.
    // If database logs, better not to call database itself in the same call.
    process.nextTick(function () {
        if (_this.silent || !_this.logDb) { //Ekliptor> fix - connection might be closed on next tick
            cb(null, true);
            return; //Ekliptor> fix
        }
        var entry = { timestamp: new Date(), level: info[LEVEL] };
        var message = util.format.apply(util, __spreadArray([info[MESSAGE]], (info.splat || []), false));
        entry.message = _this.decolorize ? message.replace(/\u001b\[[0-9]{1,2}m/g, '') : message;
        entry.meta = helpers.prepareMetaData(info.meta);
        if (_this.storeHost) {
            entry.hostname = _this.hostname;
        }
        if (_this.label) {
            entry.label = _this.label;
        }
        _this.logDb.collection(_this.collection).insertOne(entry).then(function () {
            _this.emit('logged');
            cb(null, true);
        }).catch(function (err) {
            //Ekliptor> fix
            if (err && err.toString("server instance pool was destroyed") !== -1)
                return cb(null, true);
            //Ekliptor< fix
            _this.emit('error', err);
            cb(err);
        });
    });
    return true;
};
/**
 * Query the transport. Options object is optional.
 * @param {Object=} opt_options Loggly-like query options for this instance.
 * @param {Function} cb Continuation to respond to when complete.
 * @return {*}
 */
MongoDB.prototype.query = function (opt_options, cb) {
    if (!this.logDb) {
        this._opQueue.push({ method: 'query', args: arguments });
        return;
    }
    if ('function' === typeof opt_options) {
        cb = opt_options;
        opt_options = {};
    }
    var options = this.normalizeQuery(opt_options);
    var query = { timestamp: { $gte: options.from, $lte: options.until } };
    var opt = {
        skip: options.start,
        limit: options.rows,
        sort: { timestamp: options.order === 'desc' ? -1 : 1 }
    };
    if (options.fields) {
        opt.fields = options.fields;
    }
    this.logDb.collection(this.collection).find(query, opt).toArray().then(function (docs) {
        if (!options.includeIds) {
            docs.forEach(function (log) { return delete log._id; });
        }
        cb(null, docs);
    }).catch(cb);
};
/**
 * Returns a log stream for this transport. Options object is optional.
 * This will only work with a capped collection.
 * @param {Object} options Stream options for this instance.
 * @param {Stream} stream Pass in a pre-existing stream.
 * @return {Stream}
 */
MongoDB.prototype.stream = function (options, stream) {
    var _this = this;
    options = options || {};
    stream = stream || new Stream;
    var start = options.start;
    if (!this.logDb) {
        this._opQueue.push({ method: 'stream', args: [options, stream] });
        return stream;
    }
    stream.destroy = function () {
        this.destroyed = true;
    };
    if (start === -1) {
        start = null;
    }
    var col = this.logDb.collection(this.collection);
    if (start != null) {
        col.find({}, { skip: start }).toArray().then(function (docs) {
            docs.forEach(function (doc) {
                if (!options.includeIds) {
                    delete doc._id;
                }
                stream.emit('log', doc);
            });
            delete options.start;
            _this.stream(options, stream);
        }).catch(function (err) { return stream.emit('error', err); });
        return stream;
    }
    if (stream.destroyed) {
        return stream;
    }
    col.isCapped().then(function (capped) {
        if (!capped) {
            return _this.streamPoll(options, stream);
        }
        var cursor = col.find({}, { tailable: true });
        stream.destroy = function () {
            this.destroyed = true;
            cursor.destroy();
        };
        cursor.on('data', function (doc) {
            if (!options.includeIds) {
                delete doc._id;
            }
            stream.emit('log', doc);
        });
        cursor.on('error', function (err) { return stream.emit('error', err); });
    }).catch(function (err) { return stream.emit('error', err); });
    return stream;
};
/**
 * Returns a log stream for this transport. Options object is optional.
 * @param {Object} options Stream options for this instance.
 * @param {Stream} stream Pass in a pre-existing stream.
 * @return {Stream}
 */
MongoDB.prototype.streamPoll = function (options, stream) {
    options = options || {};
    stream = stream || new Stream;
    var self = this;
    var start = options.start;
    var last;
    if (!this.logDb) {
        this._opQueue.push({ method: 'streamPoll', args: [options, stream] });
        return stream;
    }
    if (start === -1) {
        start = null;
    }
    if (start == null) {
        last = new Date(new Date - 1000);
    }
    stream.destroy = function () {
        this.destroyed = true;
    };
    (function check() {
        var query = last ? { timestamp: { $gte: last } } : {};
        self.logDb.collection(self.collection).find(query).toArray().then(function (docs) {
            if (stream.destroyed) {
                return;
            }
            if (!docs.length) {
                return next();
            }
            if (start == null) {
                docs.forEach(function (doc) {
                    if (!options.includeIds) {
                        delete doc._id;
                    }
                    stream.emit('log', doc);
                });
            }
            else {
                docs.forEach(function (doc) {
                    if (!options.includeIds) {
                        delete doc._id;
                    }
                    if (!start) {
                        stream.emit('log', doc);
                    }
                    else {
                        start -= 1;
                    }
                });
            }
            last = new Date(docs.pop().timestamp);
            next();
        }).catch(function (err) {
            if (stream.destroyed) {
                return;
            }
            next();
            stream.emit('error', err);
        });
        function next() {
            setTimeout(check, 2000);
        }
    })();
    return stream;
};
