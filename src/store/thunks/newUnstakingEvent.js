import contractAPI from "@/services/contractAPI";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateUserPool } from "../slices/poolsSlice";
import { loadUserBalance } from "./loadUserBalance";
// import { loadingWalletBalance } from "../slices/settingsSlice";

export const newUnstakingEvent = createAsyncThunk(
	"newUnstakingEvent",
	async (payload = {}, { dispatch, getState }) => {
		const state = getState();

		const { walletAddress, pool_address, amount } = payload;

		if (
			state.settings.walletAddress &&
			walletAddress.toLowerCase() === state.settings.walletAddress.toLowerCase()
		) {
			dispatch(
				updateUserPool({
					pool_address,
					amount,
					type: "unstake",
				})
			);

			dispatch(loadUserBalance());
		}
	}
);
