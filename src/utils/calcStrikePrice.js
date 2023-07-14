export const calcStrikePrice = (collateralAmount, currentLoanAmount) => {
	return (
		(10n ** 18n * BigInt(collateralAmount)) /
		BigInt(currentLoanAmount)
	).toString();
};
