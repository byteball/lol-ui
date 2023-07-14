import { store } from "..";
import { addNewLoan, removeLoan } from "@/store/slices/loansSlice";
import contractAPI from "@/services/contractAPI";
import { reduceAmountOfBuyOrder } from "@/store/slices/marketSlice";

export const SoldLoanEvent = async (...payload) => {
	console.log("event: sold loan", payload);

	const state = store.getState();
	const walletAddress = state.settings.walletAddress;

	const [loan_num, buy_order_id, buyer, seller, price] = payload;

	// If this is our loan, then we remove it from the list of "my loans"
	if (String(walletAddress).toLowerCase() === String(seller).toLowerCase()) {
		store.dispatch(removeLoan(+BigInt(loan_num).toString()));
		console.log("log: remove my loan (I sold it)");
	}

	// If we are a buyer, then you need to add a loan to the list
	if (String(walletAddress).toLowerCase() === String(buyer).toLowerCase()) {
		const loan = await contractAPI.getLoanByNum(loan_num.toString());

		const interest_multiplier =
			await contractAPI.getCurrentInterestMultiplier();

		const current_loan_amount =
			(BigInt(loan.loan_amount) * BigInt(interest_multiplier)) /
			BigInt(loan.interest_multiplier);

		store.dispatch(
			addNewLoan({
				loan_num: +loan_num.toString(),
				collateral_amount: loan.collateral_amount,
				loan_amount: loan.loan_amount,
				current_loan_amount: current_loan_amount.toString(),
				interest_multiplier: loan.interest_multiplier,
				initial_owner: walletAddress,
				ts: loan.ts,
			})
		);
	}

	console.log("price", price);

	store.dispatch(
		reduceAmountOfBuyOrder({
			buy_order_id: buy_order_id.toString(),
			amount: price.toString(),
		})
	);
};
