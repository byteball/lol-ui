import { createBuyOrder } from "@/store/slices/marketSlice";
import { store } from "..";
import { BUY_ORDER } from "@/components/organisms/OrdersScatterChart/OrdersScatterChart";

export const NewBuyOrderEvent = (...payload) => {
	console.log("event: new buy order", payload);

	const [
		buy_order_id,
		user,
		amount,
		strike_price,
		hedge_price,
		price_contract,
		data,
		current_hedge_price,
	] = payload;

	store.dispatch(
		createBuyOrder({
			user,
			buy_order_id: buy_order_id.toString(),
			amount: amount.toString(),
			strike_price: strike_price.toString(),
			hedge_price: hedge_price.toString(),
			current_hedge_price: current_hedge_price.toString(),
			type: BUY_ORDER,
		})
	);
};
