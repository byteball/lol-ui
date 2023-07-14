export const toLocalString = (numberOrString) => {
	return Number(numberOrString).toLocaleString(undefined, {
		maximumFractionDigits: 18,
	});
};
