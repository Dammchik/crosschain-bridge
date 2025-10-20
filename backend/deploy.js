import { ethers } from "ethers";
import fs from "fs";

const RPC_URLS = ["http://127.0.0.1:8545", "http://127.0.0.1:8546"];
const PRIVATE_KEYS = ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]; 

const PROVIDERS = RPC_URLS.map(url => new ethers.JsonRpcProvider(url));

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const tokenArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));
    const bridgeArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/Bridge.sol/Bridge.json", "utf8"));

    let tokenAddresses = [];
    let bridgeAddresses = [];

    for (let i = 0; i < 2; i++) {
        const { abi, bytecode } = tokenArtifact;
        const wallet = new ethers.Wallet(PRIVATE_KEYS[i], PROVIDERS[i]);

        const tokenFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        const tokenContract = await tokenFactory.deploy("MyToken", "MTK", 42);
        await tokenContract.waitForDeployment();
        await sleep(200); // wait until transaction completed
        tokenAddresses.push(tokenContract.target);
        console.log("Token deployed at: ", tokenAddresses[i]);
    }

    for (let i = 0; i < 2; i++) {
        const { abi, bytecode } = bridgeArtifact;
        const wallet = new ethers.Wallet(PRIVATE_KEYS[i], PROVIDERS[i]);

        const bridgeFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        const bridgeContract = await bridgeFactory.deploy(tokenAddresses[i]);
        await bridgeContract.waitForDeployment();
        await sleep(200);
        bridgeAddresses.push(bridgeContract.target);
        console.log("Bridge deployed at: ", bridgeContract.target);
    }

    for (let i = 0; i < 2; ++i) {
        const tokenArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/MyToken.sol/MyToken.json", "utf8"));
        const { abi: tokenAbi} = tokenArtifact;

        const tokenContract = new ethers.Contract(tokenAddresses[i], tokenAbi, PROVIDERS[i]);
        const wallet = new ethers.Wallet(PRIVATE_KEYS[i], PROVIDERS[i]);
        const tokenContractWithSigner = tokenContract.connect(wallet);

        tokenContractWithSigner.grantMinterAndBurner(bridgeAddresses[i]);
    }

    fs.writeFileSync(".env", "", { encoding: "utf8" });

    for (let i = 0; i < 2; ++i) {
        const line = `BRIDGE_${i + 1}=${bridgeAddresses[i]}\n`;
        fs.appendFileSync(".env", line, { encoding: "utf8" });
    }

    for (let i = 0; i < 2; ++i) {
        const line = `TOKEN_${i + 1}=${tokenAddresses[i]}\n`;
        fs.appendFileSync(".env", line, { encoding: "utf8" });
    }
}

main().catch(console.error);
