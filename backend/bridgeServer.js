import { ethers } from "ethers";
import fs from "fs";
import 'dotenv/config';


const SRC_RPC = "http://127.0.0.1:8545";   
const DST_RPC = "http://127.0.0.1:8546";   

const SRC_OPERATOR_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";  
const DST_OPERATOR_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";  


const srcProvider = new ethers.JsonRpcProvider(SRC_RPC);
const dstProvider = new ethers.JsonRpcProvider(DST_RPC);

const dstWallet = new ethers.Wallet(DST_OPERATOR_PRIVATE_KEY, dstProvider);

const bridgeArtifact = JSON.parse(fs.readFileSync("../artifacts/contracts/Bridge.sol/Bridge.json", "utf8"));
const { abi } = bridgeArtifact;

const SRC_BRIDGE_ADDRESS = process.env.BRIDGE_1; // TokenBridge на исходной сети
const DST_BRIDGE_ADDRESS = process.env.BRIDGE_2; // TokenBridge на целевой сети

const srcBridge = new ethers.Contract(SRC_BRIDGE_ADDRESS, abi, srcProvider);
const dstBridge = new ethers.Contract(DST_BRIDGE_ADDRESS, abi, dstWallet);

srcBridge.on("Deposit", async (depositId, from, amount, targetAddress, _) => {
    console.log("\nDeposit detected!");
    console.log("depositId: ", depositId.toString());
    console.log("from: ", from);
    console.log("amount: ", ethers.formatUnits(amount, 18));
    console.log("targetAddress: ", targetAddress);

    try {       
        const tx = await dstBridge.mint(depositId.toString(), targetAddress, amount);
        console.log("Mint tx sent:", tx.hash);
        await tx.wait();
        console.log("Mint completed for depositId:", depositId.toString());
    } catch (err) {
        console.error("Error minting:", err);
    }
});

dstBridge.on("Withdraw", async (depositId, to, amount, _) => {
    console.log("\nWithdraw detected!");
    console.log("depositId: ", depositId.toString());
    console.log("to: ", to);
    console.log("amount: ", ethers.formatUnits(amount, 18));
});

console.log("Bridge server is listening for deposits...");