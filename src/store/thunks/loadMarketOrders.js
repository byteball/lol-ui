import contractAPI from "@/services/contractAPI";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { startLoadingMarkets } from "../slices/marketSlice";

export const loadMarketOrders = createAsyncThunk(
	"loadMarketOrders",
	async (_, { dispatch, getState }) => {
		const state = getState();
		const { inited, loading } = state.market;

		console.log("log: loading markets");

		if (!inited && !loading) {
			dispatch(startLoadingMarkets());

			const [sellOrders, buyOrders] = await Promise.all([
				contractAPI.getSellOrders(),
				contractAPI.getBuyOrders(),
			]);

			console.log("log: markets has been loaded");

			return {
				sell: sellOrders,
				buy: buyOrders,
			};
		} else {
			console.log("log: markets in the cache");
		}
	}
);
