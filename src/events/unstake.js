import { newUnstakingEvent } from "@/store/thunks/newUnstakingEvent";
import { store } from "..";

export const UnstakeEvent = (...payload) => {
	console.log("event: unstake", payload);
	try {
		const state = store.getState();

		const [pool_address, user_address, amount] = payload;

		if (
			state.settings.walletAddress &&
			user_address.toLowerCase() === user_address.toLowerCase()
		) {
			store.dispatch(
				newUnstakingEvent({
					walletAddress: user_address,
					pool_address: pool_address,
					amount: amount.toString(),
				})
			);
		} else {
			console.log("event: another address");
		}
	} catch (e) {
		console.error("error: unstake event", e);
	}
};
