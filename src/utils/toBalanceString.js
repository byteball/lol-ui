import { formatUnits } from "ethers";

import appConfig from "@/appConfig";
import { toLocalString } from "./toLocalString";

export const toBalanceString = (balance, decimals = 18, sorter = true) => {
	if (balance === undefined || balance === 0 || balance === "0") return 0;

	const viewDecimals =
		decimals < appConfig.MAX_VIEW_DECIMALS
			? decimals
			: appConfig.MAX_VIEW_DECIMALS;
	const formattedUnit = +formatUnits(
		BigInt(String(balance)),
		decimals
	).toString();

	if (sorter) {
		if (formattedUnit < 1 / 10 ** viewDecimals) {
			return `< ${1 / 10 ** viewDecimals}`;
		} else if (formattedUnit > 1e9) {
			return `> 1b.`;
		}
	}

	return toLocalString(
		(+formattedUnit.toFixed(viewDecimals)).toPrecision(viewDecimals)
	);
};
