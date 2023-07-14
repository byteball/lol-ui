import contractAPI from "@/services/contractAPI";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loadingWalletBalance } from "../slices/settingsSlice";

export const loadUserBalance = createAsyncThunk(
	"loadUserBalance",
	async (inputs = {}, { dispatch, getState }) => {
		const state = getState();
		const { address, tokens } = inputs;

		dispatch(loadingWalletBalance());

		const wallet = address || state.settings.walletAddress;
		const fullTokenList =
			tokens || state.pools.allPools.map(({ address }) => address);

		if (!wallet) return {};

		return await contractAPI.getUserTokensBalance(wallet, fullTokenList);
	}
);
