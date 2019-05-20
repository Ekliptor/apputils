import * as winston from "winston";
import * as nconf from "nconf";
import * as winstonCluster from "winston-cluster";
import "./src/winston-childproc";
//import {MongoDB as MongoDbTransport} from "winston-mongodb";
import {MongoDB as MongoDbTransport} from "./src/winston-mongodb/winston-mongodb";
import * as cluster from "cluster";
import * as fs from "fs";
import {logger} from "./utils";

// levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
// debug & silly will also log prototypes of objects (if prettyPrint is not overwritten)

// fix for incorrect function parameters (module is for old winston v2)
// TODO wait for fix: https://github.com/winstonjs/winston-mongodb/issues/108
// now forked & fixed inside log function because of a 2nd bug
/*
MongoDbTransport.prototype._log = MongoDbTransport.prototype.log; // cache it
MongoDbTransport.prototype.log = function (level, msg, meta, cb) {
    let info = {
        //LEVEL: level,
        //MESSAGE: msg,
        meta: meta
    }
    info[Symbol.for('level')] = level;
    info[Symbol.for('message')] = msg;
    return MongoDbTransport.prototype._log.call(this, info, cb)
}
*/


let winstonLogger: winston.LoggerInstance;
if (process.env.IS_CHILD) {
    // spawned child process
    // forward log messages via IPC to the master process
    winstonLogger = new (winston.Logger)({transports: [
            // @ts-ignore // TODO wait for typings
            new (winston.transports.ChildProc)({
                level: nconf.get('debug') === true ? 'debug' : 'info'
            }),
        ]})

    //winstonLogger.info("Test Message!")
}
else if (cluster.isMaster) {
    // Cluster master
    let logTransports = [
        new winston.transports.Console({
            level: nconf.get('debug') === true ? 'debug' : 'info',
            colorize: true,
            timestamp: () => {
                return (require('./utils.js')).getUnixTimeStr(true)
            },
            prettyPrint: (obj) => {
                return JSON.stringify(obj) // don't print functions
            },
            handleExceptions: nconf.get('debug') === false // when debugging we use our IDE exception handler
        })
    ]
    const logfile = nconf.get('logfile') // don't pass this in as an ncof call to winston
    if (logfile !== undefined && logfile != '' && !process.env.IS_CHILD) {
        if (nconf.get('backupLastLog') === true) {
            const lastLogBackupPath = logfile + ".bak";
            try {
                fs.copyFileSync(logfile, lastLogBackupPath);
            }
            catch (err) {
                if (err && err.code !== "ENOENT") {
                    setTimeout(() => { // log after logger setup is done
                        logger.error("Error backing up last log file from %s", logfile, err);
                    }, 10);
                }
            }
        }
        if (nconf.get('deleteOldLog') === true) {
            // for logrotate and compression: https://www.npmjs.com/package/winston-logrotate
            fs.unlink(logfile, (err) => {
                // might not exist
            })
        }
        logTransports.push(new (winston.transports.File)({
            level: nconf.get('debug') === true ? 'debug' : 'info',
            filename: logfile, // will be realtive to app root
            json: nconf.get('jsonLog') === true,
            maxsize: 200 * 1024 * 1024, // 200 MB
            maxFiles: 3,
            timestamp: () => {
                return (require('./utils.js')).getUnixTimeStr(true)
            },
            prettyPrint: (obj) => {
                return JSON.stringify(obj) // don't print functions
            },
            handleExceptions: nconf.get('debug') === false
        }))
        // TODO add 2nd optional json log and fork a child process to monitor this log for errors containing certain words, send push notifiations
    }
    winstonLogger = new winston.Logger({
        transports: logTransports
        //exitOnError: false // can also be function(err), currently not working
    })

    // listen for cluster child messages
    winstonCluster.bindListeners(winstonLogger);
    // child process messages have to be caught with addChildListener() after creating the child
}
else {
    // Cluster child/worker
    // forward log messages via IPC to the master process
    winstonLogger = new (winston.Logger)({transports: [
            // @ts-ignore // TODO wait for typings
            new (winston.transports.Cluster)({
                level: nconf.get('debug') === true ? 'debug' : 'info'
            }),
        ]})
    //winstonLogger.info("Test Message!")
}

// forward console.log() calls to winston.log('info', args)
winstonLogger.log = function() {
    const forwardTo = 'info'
    if (arguments.length === 0)
        return winston.Logger.prototype.log.apply(this, arguments) // shouldn't be called at all like this
    else if (arguments.length === 1) // winston doesn't have log('foo'), redirect it to log('info', 'foo')
        return winston.Logger.prototype.log.call(this, forwardTo, arguments[0])
    let firstArg = arguments[0]
    let levels = ['silly', 'debug', 'verbose', 'info', 'warn', 'error']
    for (let level of levels) {
        if (firstArg === level)
            return winston.Logger.prototype.log.apply(this, arguments) // forward the original call
    }
    let newArgs = [forwardTo] // forward it to log('info', arguments)
    for (let i = 0; i < arguments.length; i++)
        newArgs.push(arguments[i])
    return winston.Logger.prototype.log.apply(this, newArgs)
}

export = winstonLogger