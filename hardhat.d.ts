import "hardhat/types/runtime";
import { ethers as EthersType } from "ethers";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof EthersType;
  }
}
