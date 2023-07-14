import { newClaimEvent } from "@/store/thunks/newClaimStaking";
import { store } from "..";

export const ClaimEvent = (...payload) => {
	console.log("event: claim rewards", payload);

	try {
		const state = store.getState();

		const [pool_address, user_address] = payload;

		if (
			state.settings.walletAddress &&
			user_address.toLowerCase() === user_address.toLowerCase()
		) {
			store.dispatch(
				newClaimEvent({
					walletAddress: user_address,
					pool_address,
				})
			);
		} else {
			console.log("event: another address");
		}
	} catch (e) {
		console.error("error: claim event", e);
	}
};
