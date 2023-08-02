import { createAsyncThunk } from "@reduxjs/toolkit";

import contractAPI from "@/services/contractAPI";

import { startPoolLoading } from "../slices/poolsSlice";
import { updateCollateralTokenPrice } from "../slices/settingsSlice";

import { loadUserBalance } from "./loadUserBalance";
import { getTokenPrice } from "@/utils";

export const loadStakingPools = createAsyncThunk(
	"loadStakingPools",
	async (_, { dispatch, getState }) => {
		const state = getState();

		dispatch(startPoolLoading());

		const collateralTokenPrice = await getTokenPrice(state.settings.collateralTokenAddress);
		dispatch(updateCollateralTokenPrice(collateralTokenPrice));

		const pools = await contractAPI.getAllPools({ collateralTokenPrice });

		if (state.settings.walletAddress) {
			dispatch(
				loadUserBalance({ tokens: pools.map(({ address }) => address) })
			);
		}

		return pools;
	}
);
