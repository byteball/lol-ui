import contractAPI from "@/services/contractAPI";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { startPoolLoading } from "../slices/poolsSlice";
import { loadUserBalance } from "./loadUserBalance";
import { getTokenPrice } from "@/utils";
import appConfig from "@/appConfig";
import { updateCollateralTokenPrice } from "../slices/settingsSlice";

export const loadStakingPools = createAsyncThunk(
	"loadStakingPools",
	async (_, { dispatch, getState }) => {
		const state = getState();

		dispatch(startPoolLoading());

		// TODO: вернуть в bootstrap
		const collateralTokenPrice = await getTokenPrice(appConfig.CONTRACT);
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
