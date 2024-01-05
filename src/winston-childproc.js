"use strict";
/*
 * winston-childproc.js: Transport for passing logs from child processes to the parent process
 * for logging.
 * Based on winston-cluster.js
 *
 * Author: Ekliptor
 * MIT LICENCE
 *
 */
var util = require('util');
var winston = require('winston');
//
// Remark: This should be at a higher level.
//
var code = /\u001b\[(\d+(;\d+)*)?m/g;
//
// ### function ChildProc (options)
// #### @options {Object} Options for this instance.
// Constructor function for the ChildProc transport object responsible
// for passing log information to the main process for logging
//
var ChildProc = exports.ChildProc = function (options) {
    options = options || {};
    winston.Transport.call(this, options);
    this.name = 'childproc';
};
//
// Inherit from `winston.Transport`.
//
util.inherits(ChildProc, winston.Transport);
//
// Define a getter so that `winston.transports.ChildProc`
// is available and thus backwards compatible.
//
winston.transports.ChildProc = ChildProc;
//
// Expose the name of this Transport on the prototype
//
ChildProc.prototype.name = 'childproc';
//
// ### function bindListeners (instance)
// Binds listeners to worker threads to collect log information
// Instance is an optional logging instance to bind to
// TODO: allow callback for non-logging events
//
var addChildListener = exports.addChildListener = function (loggerInstance, childProc) {
    function messageHandler(msg) {
        if (msg.cmd && msg.cmd === 'log') {
            var level = msg.level;
            var message = msg.msg;
            var meta = msg.meta || {};
            meta.child = msg.child;
            if (loggerInstance != null) {
                loggerInstance.log(level, message, meta);
            }
            else {
                winston.log(level, message, meta);
            }
        }
    }
    childProc.on('message', messageHandler);
};
//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
ChildProc.prototype.log = function (level, msg, meta, callback) {
    if (!process.env.PARENT_PROCESS_ID)
        throw new Error("Process environment variable 'PARENT_PROCESS_ID' has to be set in child process for log messages to be forwarded");
    if (this.silent) {
        return callback(null, true);
    }
    if (this.stripColors) {
        msg = ('' + msg).replace(code, '');
    }
    var message = {
        cmd: 'log',
        child: process.env.PARENT_PROCESS_ID,
        level: level,
        msg: msg,
        meta: meta
    };
    process.send(message);
    this.emit('logged');
    callback(null, true);
    return message;
};
//TODO: can I remove the following stubs?
//
// ### function _write (data, cb)
// #### @data {String|Buffer} Data to write to the instance's stream.
// #### @cb {function} Continuation to respond to when complete.
// Write to the stream, ensure execution of a callback on completion.
//
ChildProc.prototype._write = function (data, callback) {
};
//
// ### function query (options, callback)
// #### @options {Object} Loggly-like query options for this instance.
// #### @callback {function} Continuation to respond to when complete.
// Query the transport. Options object is optional.
//
ChildProc.prototype.query = function (options, callback) {
};
//
// ### function stream (options)
// #### @options {Object} Stream options for this instance.
// Returns a log stream for this transport. Options object is optional.
//
ChildProc.prototype.stream = function (options) {
};
//
// ### function open (callback)
// #### @callback {function} Continuation to respond to when complete
// Checks to see if a new file needs to be created based on the `maxsize`
// (if any) and the current size of the file used.
//
ChildProc.prototype.open = function (callback) {
    callback();
};
//
// ### function close ()
// Closes the stream associated with this instance.
//
ChildProc.prototype.close = function () {
    var self = this;
};
//
// ### function flush ()
// Flushes any buffered messages to the current `stream`
// used by this instance.
//
ChildProc.prototype.flush = function () {
    var self = this;
};
module.exports = exports;
