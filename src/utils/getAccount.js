import { sendNotification } from "@/store/thunks/sendNotification";
import { store } from "..";

export const getAccount = async () => {
	if (!window.ethereum) {
		store.dispatch(
			sendNotification({ title: "MetaMask not found", type: "error" })
		);
		throw "MetaMask not found";
	}

	const [account] = await window.ethereum.request({
		method: "eth_requestAccounts",
	});

	return account;
};
