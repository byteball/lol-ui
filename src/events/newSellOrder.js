import { createSellOrder } from "@/store/slices/marketSlice";
import { store } from "..";
import { SELL_ORDER } from "@/components/organisms/OrdersScatterChart/OrdersScatterChart";
import contractAPI from "@/services/contractAPI";

export const NewSellOrderEvent = async (...payload) => {
	console.log("event: new sell order", payload);

	const [loan_num, user, price, price_contract, data, current_price] = payload;

	const loan = await contractAPI.getLoanByNum(loan_num.toString());

	const interest_multiplier = await contractAPI.getCurrentInterestMultiplier();

	const current_loan_amount =
		(BigInt(loan.loan_amount) * BigInt(interest_multiplier)) /
		BigInt(loan.interest_multiplier);

	const strike_price =
		(10n ** 18n * BigInt(loan.collateral_amount)) / current_loan_amount;

	store.dispatch(
		createSellOrder({
			user,
			price: price.toString(),
			price_contract,
			data: data.toString(),
			current_price: current_price.toString(),
			loan_num: loan_num.toString(),
			collateral_amount: loan.collateral_amount,
			current_loan_amount: current_loan_amount.toString(),
			strike_price: strike_price.toString(),
			type: SELL_ORDER,
		})
	);
};
