import { ethers } from "ethers";
import fs from "fs";
import 'dotenv/config';

const RPC_URL = "http://127.0.0.1:8545";
const PROVIDER = new ethers.JsonRpcProvider(RPC_URL);

const DEPOSIT_ID = 1;

const TOKEN_DEPLOYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 0-й аккаунт
const TOKEN_DEPLOYER_WALLET = new ethers.Wallet(TOKEN_DEPLOYER_PRIVATE_KEY, PROVIDER);

const USER_PRIVATE_KEY = "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"; // 7-й аккаунт
const USER_WALLET = new ethers.Wallet(USER_PRIVATE_KEY, PROVIDER);

async function main() { 
    const bridgeArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/TokenBridge.sol/TokenBridge.json", "utf8"));
    const tokenArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/MyERC20Token.sol/MyERC20Token.json", "utf8"));

    const { abi: bridgeAbi } = bridgeArtifact;
    const { abi: tokenAbi} = tokenArtifact;

    const bridgeContract = new ethers.Contract(process.env.BRIDGE_1, bridgeAbi, PROVIDER);
    const tokenContract = new ethers.Contract(process.env.TOKEN_1, tokenAbi, PROVIDER);

    const bridgeContractWithSigner = bridgeContract.connect(USER_WALLET);
    const tokenContractWithSigner = tokenContract.connect(TOKEN_DEPLOYER_WALLET);

    console.log("before funcs");
    tokenContractWithSigner.mint("0x14dc79964da2c08b23698b3d3cc7ca32193d9955", 22);
    console.log("after mint");
    bridgeContractWithSigner.deposit(DEPOSIT_ID, 10, "0x14dc79964da2c08b23698b3d3cc7ca32193d9955");
    console.log("after depo");
}

main().catch(console.error);
