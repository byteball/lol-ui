import { createDraftSafeSelector } from "@reduxjs/toolkit";

import { selectMarketOrders } from "./selectMarketOrders";
import { selectWalletAddress } from "../slices/settingsSlice";

export const selectMyMarketOrders = createDraftSafeSelector(
	selectMarketOrders,
	selectWalletAddress,
	(orders, wallet) =>
		orders
			.filter(
				({ user }) =>
					String(user).toLowerCase() === String(wallet).toLowerCase()
			)
			.sort(
				(a, b) =>
					+(
						BigInt(b.current_loan_amount || b.amount) -
						BigInt(a.current_loan_amount || a.amount)
					).toString()
			)
);
