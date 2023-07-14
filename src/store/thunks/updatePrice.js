import { createAsyncThunk } from "@reduxjs/toolkit";

import { ethers } from "ethers";

export const updatePrice = createAsyncThunk(
	"update_price",
	async (_, { getState }) => {
		const state = getState();

		if (state.params.oracle === ethers.ZeroAddress) {
			return 0.001;
		} else {
			// TODO: fix it when we will have a oracle
			return 0;
		}
	}
);
