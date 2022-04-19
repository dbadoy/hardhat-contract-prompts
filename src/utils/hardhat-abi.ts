import * as fs from 'fs';

const DefaultPath = 'artifacts/contracts';

export class AbiBuilder {
    readonly keys: string[] = [];
    readonly prefix: any = {};
    readonly fileNamesList: any = {};
    readonly abiPaths: any = [];

    constructor() {
        const dirList = fs.readdirSync(DefaultPath);
        for (const dirName of dirList) {
            const contractName = dirName.split('.')[0];
            this.prefix[contractName] = DefaultPath + '/' + dirName
        }
        this.keys = Object.keys(this.prefix);
        return this;
    }

    load() {
        for (const key of this.keys) {
            const files = fs.readdirSync(this.prefix[key]);
            this.fileNamesList[key] = files;            
        }
        return this;
    }

    parse() {
        for (const key of this.keys) {
            const fileNames = this.fileNamesList[key];
            for (let i = 0; i < fileNames.length; i ++) {
                const res = fileNames[i].split('.');
                if (res.length > 2) {
                    continue;
                }
                this.abiPaths.push(this.prefix[key] + '/' + fileNames[i]);
            }
        }
        return this;
    }

    build(): HardhatContractAbi {
        if (this.abiPaths === undefined) { throw new Error('temp1'); }
        return new HardhatContractAbi(this.abiPaths);
    }
}

export class HardhatContractAbi {
    readonly AbiMap: any = {};

    constructor(abiPaths: any) {
        for (const abiPath of abiPaths) {
            // need correct path.
            const { contractName, abi } = require('../' + abiPath);
            if (abi.length == 0) { continue; }
            this.AbiMap[contractName] = abi;
        }
    }

    get() {
        return this.AbiMap;
    }

    getKeys(): string[] {
        return Object.keys(this.AbiMap);
    }

    getAbiByKey(key: string): any {
        return this.AbiMap[key];
    }
}