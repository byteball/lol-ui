import { cancelBuyOrder } from "@/store/slices/marketSlice";
import { store } from "..";

export const CancelBuyOrderEvent = (...payload) => {
	console.log("event: cancel buy order", payload);

	const [buyOrderBigInt] = payload;

	store.dispatch(cancelBuyOrder(buyOrderBigInt.toString()));
};
