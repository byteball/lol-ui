import { newStakingEvent } from "@/store/thunks/newStakingEvent";
import { store } from "..";

export const StakeEvent = (...payload) => {
	console.log("event: stake");

	try {
		const [pool_address, user_address, amount] = payload;

		const state = store.getState();

		if (
			state.settings.walletAddress &&
			user_address.toLowerCase() === user_address.toLowerCase()
		) {
			store.dispatch(
				newStakingEvent({
					walletAddress: user_address,
					pool_address: pool_address,
					amount: amount.toString(),
				})
			);
		} else {
			console.log("event: another address");
		}
	} catch (e) {
		console.error("error: stake event", e);
	}
};
