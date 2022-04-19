# hardhat-contract-prompts
It's project that build CLI prompt with your Solidity codes.<br>
It will be helpful for testing Solidity code.

- [X] 1. Build View method
- [ ] 2. Build Invoke method
- [ ] 3. 
- [ ] 4. 

## Usage
1. Place solidity code to 'contracts' in hardhat project path.
2. Import prompt.
```
import { ViewContractPrompt } from 'hardhat-contract-prompts';
```
3. Generate prompt.
```
const vcp = new ViewContractPrompt();
```
4. Set contract name, prompt message.
```
await vcp.prepare('CONTRACT_NAME', 'my prompts...');
```
5. Execute.
```
// contract -> ethers.Contract
const res = await vcp.executre(contract);
console.log(res);
```
6. Run script.
```
// It doesn't work in 'npx hardhat test'. Use 'hardhat run'.
$ npx hardhat run [script]
```

## Example
#### Example 1 : Greeter
```Typescript
import { ViewContractPrompt } from './hardhat-prompt';

async function temp() {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
    await setGreetingTx.wait();

    const vcp = new ViewContractPrompt();
    await vcp.prepare('Greeter', 'greeter test prompts.');

    const res = await vcp.execute(greeter);
    console.log(res);
}

// npx hardhat run test/greeter.ts
```

#### Run
<img width="668" alt="스크린샷 2022-04-20 오전 12 55 19" src="https://user-images.githubusercontent.com/72970043/164045986-46295a07-2e00-43dc-af88-baabd0750a15.png">
<img width="553" alt="스크린샷 2022-04-20 오전 12 55 36" src="https://user-images.githubusercontent.com/72970043/164046022-636191df-4de7-43ff-97fb-5b31a24d0f9f.png">


<hr>

#### Example 2 : myERC20
```Typescript
import { ViewContractPrompt } from './hardhat-prompt';

async function temp() {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(ethers.utils.parseEther('100000000'), 'MyToken', 'MTK');
    await token.deployed();

    const vcp = new ViewContractPrompt();
    await vcp.prepare('Token', 'Token test prompts.');

    const res = await vcp.execute(token);
    console.log(res);
}

// npx hardhat run test/token.ts
```

#### Run
<img width="639" alt="스크린샷 2022-04-20 오전 12 56 00" src="https://user-images.githubusercontent.com/72970043/164046114-eb572ad5-f47c-43a7-8985-006cf0a03b0a.png">

<img width="849" alt="스크린샷 2022-04-20 오전 12 56 59" src="https://user-images.githubusercontent.com/72970043/164046213-132c5102-4e53-4e62-8b23-9be19e4814ea.png">

<img width="874" alt="스크린샷 2022-04-20 오전 12 57 13" src="https://user-images.githubusercontent.com/72970043/164046252-f6e408b1-9363-43d6-a316-ec1a70eec1fc.png">

<img width="856" alt="스크린샷 2022-04-20 오전 12 58 01" src="https://user-images.githubusercontent.com/72970043/164046266-2030fba2-80f9-460f-acf0-9d98d6120cd0.png">


