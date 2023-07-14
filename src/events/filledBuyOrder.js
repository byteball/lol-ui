import { cancelBuyOrder } from "@/store/slices/marketSlice";
import { store } from "..";

export const FilledBuyOrderEvent = (...payload) => {
	console.log("event: filled buy order", payload);

	const [buyOrderBigInt] = payload;

	store.dispatch(cancelBuyOrder(buyOrderBigInt.toString()));
};
