import * as fs from "fs";

const DEFAULT_LINES = 100
const INITIAL_LING_LENGTH = 128

export interface TailCallback {
    (error: any, lines?: string[]): void;
}

export default function tail(fileName: string, lineCount: number, cb: TailCallback) {

    if(!lineCount)
        lineCount = DEFAULT_LINES

    fs.open(fileName,'r',function(err,fd){
        if(err) return cb({txt: "error open", err: err});

        fs.fstat(fd,function(err,stat) {
            if(err) return cb({txt: "error fstat", err: err});

            let pos = stat.size
            let togo = lineCount * INITIAL_LING_LENGTH
            let textBuff = ""
            let lines = []
            let index = 0

            let getNextText = () => {
                if(pos > togo)
                    pos = pos - togo;
                else {
                    togo = pos;
                    pos = 0;
                }
                 
                fs.read(fd,new Buffer(togo),0,togo,pos,function(err,bytesRead,buf) {
                    if(err) return cb({txt: "error read", err: err});

                    textBuff = buf + textBuff
                    index += buf.length

                    while (lines.length < lineCount) {
                        let lf = textBuff.lastIndexOf("\n", index);
                        if (lf == -1)
                            break;
                        let line = textBuff.substr(lf, index - lf + 1)
                        lines.push(line)
                        index = lf - 1
                        if (lf == 0) // Note if \n is the first char in the string we need to break here index will become negative -1 this will be fixed in index += buf.length
                            break;
                    }

                    if (lines.length >= lineCount || pos == 0) {
                        if (pos == 0 && lines.length < lineCount) { // in this case we are missing the very first top line as it is missing a \n infront
                            let line = textBuff.substr(0, index)
                            lines.push(line)
                        }
                        return cb(null, lines.reverse())
                    }
                    else
                        getNextText()
                })
            }
            getNextText()
        })
    })
}