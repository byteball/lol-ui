import { createAsyncThunk } from "@reduxjs/toolkit";

import { updateUserPool } from "../slices/poolsSlice";
import { loadUserBalance } from "./loadUserBalance";

export const newClaimEvent = createAsyncThunk(
	"newClaimEvent",
	async (payload = {}, { dispatch, getState }) => {
		const state = getState();

		const { walletAddress, pool_address } = payload;

		if (
			state.settings.walletAddress &&
			walletAddress.toLowerCase() === state.settings.walletAddress.toLowerCase()
		) {
			dispatch(
				updateUserPool({
					pool_address,
					type: "claim",
				})
			);

			dispatch(loadUserBalance());
		} else {
			console.log("error: another claim");
		}
	}
);
