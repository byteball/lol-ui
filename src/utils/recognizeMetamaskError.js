export const recognizeMetamaskError = (error = {}) => {
	let type = "error";
	let title = "Unknown error, please try again later";

	const { info } = error;

	const errorCode = info?.error?.data?.code;

	if (errorCode === 3) {
		title = "Transfer amount exceeds balance";
	} else if (info?.error?.code === 4001) {
		title = "You denied transaction signature";
	} else if (error?.code === "another-user") {
		title = "You are signed in to another account";
	}

	return {
		title,
		type,
	};
};
