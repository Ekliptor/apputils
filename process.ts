

export function addChildProcessArgument(args: string[], key: string, value: string) {
    let argsCopy: string[] = Object.assign([], args);
    let keyLen = key.length;
    let found = false;
    for (let i=0; i < argsCopy.length; i++)
    {
        if (argsCopy[i].substr(0, keyLen) === key) {
            argsCopy[i] = key + "=" + value;
            found = true;
            break;
        }
    }
    if (!found)
        argsCopy.push(key + "=" + value)
    return argsCopy;
}