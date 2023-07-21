import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, formatUnits } from "ethers";

import OracleAbi from "@/abi/Oracle";
import { provider } from "@/services/provider";

export const updatePrice = createAsyncThunk(
	"update_price",
	async (_, { getState }) => {
		const state = getState();

		if (state.params.oracle === ethers.ZeroAddress) {
			return 0.001;
		} else {
			const oracleContract = new ethers.Contract(state.params.oracle, OracleAbi, provider);

			const currentPrice = await oracleContract.getCurrentPrice();
			const averagePrice = await oracleContract.getAveragePrice();

			return currentPrice > averagePrice ? +formatUnits(BigInt(currentPrice), 18) : +formatUnits(BigInt(averagePrice), 18);
		}
	}
);
