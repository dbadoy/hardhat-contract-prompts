import ethers from 'ethers';
import prompts from 'prompts';
import { AbiBuilder, HardhatContractAbi } from './utils/hardhat-abi';
import { formatType } from './utils/format';

interface ParsedAbi {
    name: string
    inputs: AbiInput[]
}

interface AbiInput {
    interanlType: string
    name: string
    type: string
}

interface Choice {
    title: string
    description: string
    value: any
}

interface AbiMethodParser {
    (abi: any): boolean
}

export class BaseContractPrompt {
    private prompt: any;
    
    private defaultPromptParser: AbiMethodParser = (abi: any) => { return true; }

    readonly hca: HardhatContractAbi;
    readonly parsedAbis: {[k: string]: any} = {};

    constructor() {
        this.hca = new AbiBuilder().load().parse().build();
    }

    protected parser(parserOpt: AbiMethodParser | undefined) {
        if (parserOpt === undefined) { parserOpt = this.defaultPromptParser; }

        const contractNames = this.hca.getKeys();
        for (const contractName of contractNames) {
            const abis = this.hca.getAbiByKey(contractName);
            let tFunc: any[] = [];

            for (const abi of abis) {
                if (parserOpt(abi)) {
                    tFunc.push({
                        name: abi.name,
                        inputs: abi.inputs    
                    })
                }
            }
            this.parsedAbis[contractName] = tFunc;
        }
    }

    public async prepare(contractName: string, mesg: string) {
        const cic = await this.generateChoices(contractName);
        this.prompt = prompts([
            {
                type: 'select',
                name: 'value',
                message: mesg,
                choices: cic,
                initial: 0
            }
        ]);
    }

    public async execute(contract: ethers.Contract): Promise<any> {
        if (this.prompt === undefined) { throw new Error('prepare() first.'); }
        const res = await this.prompt;
        const param: string[] = await this.getter(res.value);

        let result: any;
        if (param.length > 0)
            result = await contract[res.value.name](...param);
        else
            result = await contract[res.value.name]();

        return result;
    }

    public getParsedAbis() {
        return this.parsedAbis;
    }

    public getParsedAbi(contractName: string) {
        return this.parsedAbis[contractName] ?? new Error('non exist contract !');
    }

    private async getter(pAbi: ParsedAbi): Promise<string[]> {
        let result: string[] = [];
    
        if (pAbi.inputs.length != 0) {
            for await (const input of pAbi.inputs) {
                const insert = await prompts([{
                    type: 'text',
                    name: 'value',
                    message: input.name + '(' + input.type + ')'
                }]);

                const res = formatType(input.type, insert.value);
                result.push(res);
            }
        }
        return result;
    }

    private async generateChoices(contractName: string): Promise<Choice[]> {
        const pa = this.getParsedAbi(contractName);

        let cic: Choice[] = [];
        for await (const pAbi of pa) {
            let choice = {
                title: pAbi.name,
                description: JSON.stringify(pAbi.inputs),
                value: pAbi
            }
            cic.push(choice);
        }

        return cic;
    }
}

export class ViewContractPrompt extends BaseContractPrompt {
    private parserOpt: AbiMethodParser = (abi: any) => {
        if (abi.type == 'function' && abi.stateMutability == 'view') {
            return true;
        }
        return false;
    }

    constructor() {
        super();
        this.parser(this.parserOpt);
    }
}

export class InvokeContractPrompt extends BaseContractPrompt {
    private parserOpt: AbiMethodParser = (abi: any) => {
        if (abi.type == 'function' && abi.stateMutability != 'view') {
            return true;
        }
        return false;
    }

    constructor() {
        super();
        this.parser(this.parserOpt);
    }
}
