import { createSlice } from "@reduxjs/toolkit";

export const paramsSlice = createSlice({
	name: "params",
	initialState: {
		inited: false,
	},
	reducers: {
		updateParams: (state, action) => {
			const {
				originationFee,
				interestRate,
				totalRewardShare,
				oracle,
				exchangeFee,
			} = action.payload;
			state.inited = true;

			state.originationFee = originationFee;
			state.interestRate = interestRate;
			state.totalRewardShare = totalRewardShare;
			state.exchangeFee = exchangeFee;
			state.oracle = oracle;
		},
		clearParams: (state) => {
			state.inited = false;
		},
	},
});

export const { updateParams, clearParams } = paramsSlice.actions;

export default paramsSlice.reducer;

export const selectParams = (state) => state.params;
