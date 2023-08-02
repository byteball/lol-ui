import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

import { loadStakingPools } from "../thunks/loadStakingPools";
import appConfig from "@/appConfig";
import { saveAddressAndLoadLoans } from "../thunks/saveAddressAndLoadLoans";
import { logout } from "./settingsSlice";
import { formatUnits } from "ethers";

const persistConfig = {
	key: `line-ui-pools`,
	keyPrefix: appConfig.TESTNET ? "testnet:" : "livenet:",
	version: 1,
	storage,
	whitelist: ["updatedAt", "allPools", "loading"],
};

export const poolsSlice = createSlice({
	name: "pools",
	initialState: {
		updatedAt: 0,
		allPools: [],
		userPools: [],
		loading: true,
		loadingUsersPools: true,
	},
	reducers: {
		startPoolLoading: (state) => {
			state.loading = true;
		},
		updateUserPool: (state, action) => {
			const { type, amount, pool_address } = action.payload;

			const poolIndex = state.userPools.findIndex(
				({ address }) => pool_address.toLowerCase() === address.toLowerCase()
			);

			if (type === "stake") {
				if (poolIndex >= 0) {
					// user already stake in this pool
					const { stake } = state.userPools[poolIndex];

					state.userPools[poolIndex].stake = (
						BigInt(stake) + BigInt(amount)
					).toString();
				} else {
					const addedPoolIndex = state.allPools.findIndex(
						({ address }) =>
							pool_address.toLowerCase() === address.toLowerCase()
					);

					state.userPools.push({
						stake: amount.toString(),
						address: pool_address,
						reward: "0",
						reward_share: formatUnits(
							state.allPools[addedPoolIndex].reward_share10000,
							4
						),
					});
				}
			} else if (type === "unstake" && poolIndex >= 0) {
				const { stake } = state.userPools[poolIndex];

				state.userPools[poolIndex].stake = (
					BigInt(stake) - BigInt(amount)
				).toString();
			} else if (type === "claim" && poolIndex >= 0) {
				state.userPools[poolIndex].reward = "0";
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loadStakingPools.fulfilled, (state, action) => {
			state.allPools = action.payload;
			state.updatedAt = Date.now();
			state.loading = false;
		});

		builder.addCase(saveAddressAndLoadLoans.pending, (state) => {
			state.loadingUsersPools = true;
		});

		builder.addCase(saveAddressAndLoadLoans.fulfilled, (state, action) => {
			state.userPools = action?.payload?.pools || [];
			state.loadingUsersPools = false;
		});

		builder.addCase(logout, (state) => {
			state.userPools = [];
		});
	},
});

export const { startPoolLoading, updateUserPool } = poolsSlice.actions;

export default persistReducer(persistConfig, poolsSlice.reducer);

export const selectAllPools = (state) => state.pools.allPools || [];
export const selectPoolsLoading = (state) => state.pools.loading;
export const selectUserPools = (state) => state.pools?.userPools || []; // don't use it! use 'selectUserPoolsWithMeta'
export const selectUserPoolsLoading = (state) => state.pools.loadingUsersPools;
