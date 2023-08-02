import { createAsyncThunk } from "@reduxjs/toolkit";

import { getLinePrice } from "@/utils";

export const updatePrice = createAsyncThunk(
	"update_price",
	async (_, { getState }) => {
		const state = getState();

		return await getLinePrice(state.params.oracle);
	}
);
