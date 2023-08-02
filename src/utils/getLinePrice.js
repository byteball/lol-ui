import OracleAbi from "@/abi/Oracle";
import { provider } from "@/services/provider";
import { ZeroAddress, ethers, formatUnits } from "ethers";

export const getLinePrice = async (oracle) => {
  if (oracle === ZeroAddress) {
    return 0.001;
  } else {
    const oracleContract = new ethers.Contract(oracle, OracleAbi, provider);

    const currentPrice = await oracleContract.getCurrentPrice();
    const averagePrice = await oracleContract.getAveragePrice();

    return currentPrice > averagePrice ? +formatUnits(BigInt(currentPrice), 18) : +formatUnits(BigInt(averagePrice), 18);
  }
}
