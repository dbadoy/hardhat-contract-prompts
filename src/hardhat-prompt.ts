import ethers from 'ethers';
import prompts from 'prompts';
import { AbiBuilder, HardhatContractAbi } from './hardhat-abi';

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
    title: string,
    description: string,
    value: any
}

export class BaseContractPrompt {
    private prompt: any;
    readonly hca: HardhatContractAbi;
    readonly parsedAbis: {[k: string]: any} = {};

    constructor() {
        this.hca = new AbiBuilder().load().parse().build();
    }

    Parser(parserOpt: any | undefined) {
        if (parserOpt === undefined) { parserOpt = this.DefaultPromptParserOpt; }

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

    DefaultPromptParserOpt(abi: any): boolean {
        return true;
    }

    getParsedAbis() {
        return this.parsedAbis;
    }

    getParsedAbi(contractName: string) {
        return this.parsedAbis[contractName] ?? new Error('non exist contract !');
    }

    async getter(pAbi: ParsedAbi): Promise<string[]> {
        let result: string[] = [];
    
        if (pAbi.inputs.length != 0) {
            for await (const input of pAbi.inputs) {
                const response = await prompts([{
                    type: 'text',
                    name: 'value',
                    message: input.name + '(' + input.type + ')'
                }]);
                result.push(response.value);
            }
        }
        return result;
    }

    async generateChoices(contractName: string): Promise<Choice[]> {
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

    async prepare(contractName: string, mesg: string) {
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

    async execute(contract: ethers.Contract): Promise<any> {
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
}

export class ViewContractPrompt extends BaseContractPrompt {
    constructor() {
        super();
        this.Parser(this.ViewPromptParserOpt);
    }

    ViewPromptParserOpt(abi: any): boolean {
        if (abi.type == 'function' && abi.stateMutability == 'view') {
            return true;
        }
        return false;
    }
}
