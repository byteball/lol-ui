import { createSlice } from "@reduxjs/toolkit";
import { loadMarketOrders } from "../thunks/loadMarketOrders";

const initialState = {
	sellOrders: [],
	buyOrders: [],
	loading: false,
	inited: false,
};

export const marketSlice = createSlice({
	name: "market",
	initialState,
	reducers: {
		clearMarkets: (state) => {
			console.log("log: clear markets");
			state = initialState;
		},
		startLoadingMarkets: (state) => {
			state.loading = true;
		},
		createBuyOrder: (state, action) => {
			state.buyOrders.push(action.payload);
		},
		createSellOrder: (state, action) => {
			state.sellOrders.push(action.payload);
		},
		reduceAmountOfBuyOrder: (state, action) => {
			const orderIndex = state.buyOrders.findIndex(
				({ buy_order_id }) => buy_order_id === action.payload.buy_order_id
			);

			if (orderIndex >= 0) {
				state.buyOrders[orderIndex].amount = (
					BigInt(state.buyOrders[orderIndex].amount) -
					BigInt(action.payload.amount)
				).toString();
			}
		},
		cancelBuyOrder: (state, action) => {
			const id = action.payload;

			state.buyOrders = state.buyOrders.filter(
				({ buy_order_id }) => buy_order_id !== id
			);
		},
		cancelSellOrder: (state, action) => {
			const num = action.payload;

			state.sellOrders = state.sellOrders.filter(
				({ loan_num }) => loan_num !== num
			);
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loadMarketOrders.fulfilled, (state, action) => {
			if (action.payload) {
				state.loading = false;
				state.inited = true;
				state.sellOrders = action.payload?.sell || [];
				state.buyOrders = action.payload?.buy || [];
			}
		});
	},
});

export const {
	startLoadingMarkets,
	clearMarkets,
	cancelBuyOrder,
	cancelSellOrder,
	createBuyOrder,
	createSellOrder,
	reduceAmountOfBuyOrder,
} = marketSlice.actions;

export default marketSlice.reducer;

export const selectBuyMarketOrders = (state) => state.market.buyOrders;
export const selectSellMarketOrders = (state) => state.market.sellOrders;
export const selectMarketInited = (state) => state.market.inited;
