import { cancelSellOrder } from "@/store/slices/marketSlice";
import { store } from "..";

export const CancelSellOrderEvent = (...payload) => {
	console.log("event: cancel sell order", payload);

	const [sellLoansOrderBigInt] = payload;

	store.dispatch(cancelSellOrder(sellLoansOrderBigInt.toString()));
};
