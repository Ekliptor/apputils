import * as winston from "winston";
import "./src/winston-childproc";
declare let winstonLogger: winston.LoggerInstance;
export = winstonLogger;
