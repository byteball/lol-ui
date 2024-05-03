import { ethers } from "ethers";

import { provider } from "@/services/provider";
import { store } from "..";
import { addDecimals } from "@/store/slices/cacheSlice";

export const getDecimals = async (ERC20tokenAddress) => {
    const state = store.getState();

    if (state.cache.decimalsByToken[ERC20tokenAddress.toLowerCase()]) {
        return Number(state.cache.decimalsByToken[ERC20tokenAddress.toLowerCase()]);
    } else if (ethers.ZeroAddress === ERC20tokenAddress) { 
        return 18
    }

    const erc20Abi = ["function decimals() view returns (uint256)"];

    const contract = new ethers.Contract(ERC20tokenAddress, erc20Abi, provider);
    const decimals = await contract.decimals();

    store.dispatch(addDecimals({ token: ERC20tokenAddress.toLowerCase(), decimals: decimals.toString() }));

    return Number(decimals);
}