import { addNewLoan, removeLoan } from "@/store/slices/loansSlice";
import { store } from "..";
import contractAPI from "@/services/contractAPI";
import { cancelSellOrder } from "@/store/slices/marketSlice";

export const BoughtLoanEvent = async (...payload) => {
	console.log("event: bought loan", payload);

	const [loan_num, buyer, seller] = payload;
	const state = store.getState();
	const walletAddress = String(state.settings.walletAddress).toLowerCase();

	if (String(seller).toLowerCase() === walletAddress) {
		store.dispatch(removeLoan(+loan_num.toString()));
	} else if (String(buyer).toLowerCase() === walletAddress) {
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

	store.dispatch(cancelSellOrder(loan_num.toString()));
};
