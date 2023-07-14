import { createAsyncThunk } from "@reduxjs/toolkit";

import contractAPI from "@/services/contractAPI";
import { saveWalletAddress } from "@/store/slices/settingsSlice";
import { loadUserBalance } from "./loadUserBalance";

export const saveAddressAndLoadLoans = createAsyncThunk(
	"saveAddressAndLoadLoans",
	async (address, store) => {
		if (!address) return { loans: [], pools: [] };

		const state = store.getState();

		store.dispatch(saveWalletAddress(address));

		const pools = await contractAPI.getStakingPoolByAddress(address);

		if (Object.keys(state.settings.walletBalance).length === 0) {
			store.dispatch(
				loadUserBalance({
					address,
					tokens: pools.map(({ address }) => address),
				})
			);
		}

		const loans = await contractAPI.getLoansByUserAddress(address);

		return {
			loans,
			pools,
		};
	}
);
