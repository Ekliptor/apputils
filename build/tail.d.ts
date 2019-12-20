export interface TailCallback {
    (error: any, lines?: string[]): void;
}
export default function tail(fileName: string, lineCount: number, cb: TailCallback): void;
