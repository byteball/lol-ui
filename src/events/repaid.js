import { removeLoan } from "@/store/slices/loansSlice";
import { store } from "..";

export const RepaidEvent = (...payload) => {
	console.log("event: repaid", payload);

	const [loan_num, initial_owner] = payload;

	const state = store.getState();

	if (
		state.settings.walletAddress &&
		state.settings.walletAddress.toLowerCase() === initial_owner.toLowerCase()
	) {
		store.dispatch(removeLoan(+loan_num.toString()));
	}
};
