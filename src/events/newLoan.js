import moment from "moment";

import { store } from "..";
import { addNewLoan } from "@/store/slices/loansSlice";

export const NewLoanEvent = (...payload) => {
	console.log("event: new loan", payload);

	const state = store.getState();

	const [
		loan_num,
		initial_owner,
		collateral_amount,
		loan_amount,
		net_loan_amount,
		interest_multiplier,
	] = payload;

	if (
		state.settings.walletAddress &&
		state.settings.walletAddress.toLowerCase() === initial_owner.toLowerCase()
	) {
		store.dispatch(
			addNewLoan({
				loan_num: +loan_num.toString(),
				initial_owner,
				collateral_amount: collateral_amount.toString(),
				loan_amount: loan_amount.toString(),
				current_loan_amount: loan_amount.toString(),
				interest_multiplier: interest_multiplier.toString(),
				net_loan_amount: net_loan_amount.toString(),
				ts: moment.utc().unix(),
			})
		);
	}
};
