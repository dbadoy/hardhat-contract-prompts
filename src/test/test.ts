import { ethers } from 'hardhat';
import { ViewContractPrompt } from './hardhat-prompt';

const MY_TOKEN_ABI = [];
const CONTRACT_NAME = "myToken";
const CONTRACT_ADDRESS = "0xDb862d6fFECe63A04c4cE9cabdEDD96316E690Eb";

async function main() {
    const vcp = new ViewContractPrompt();

    const provider = new ethers.providers.StaticJsonRpcProvider(
        "http://127.0.0.1:8545", {chainId: 1337, name: 'localhost'}
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MY_TOKEN_ABI, provider);

    await vcp.prepare(CONTRACT_NAME, 'My test hardhat prompt for view.');

    const res = await vcp.execute(contract);
    console.log(res);
}

main();