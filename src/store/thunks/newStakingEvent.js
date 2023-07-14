import { createAsyncThunk } from "@reduxjs/toolkit";

import { updateUserPool } from "../slices/poolsSlice";
import { loadUserBalance } from "./loadUserBalance";

export const newStakingEvent = createAsyncThunk(
	"newStakingEvent",
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
					type: "stake",
				})
			);

			dispatch(loadUserBalance());
		}
	}
);
