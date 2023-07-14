import { createDraftSafeSelector } from "@reduxjs/toolkit";

import { selectMarketOrders } from "./selectMarketOrders";
import { selectLoans } from "../slices/loansSlice";

export const selectCheckedBySaleLoans = createDraftSafeSelector(
	selectLoans,
	selectMarketOrders,
	(loans, orders) => {
		const loansNum = orders
			.map((l) => l.loan_num)
			.filter((v) => v !== undefined);
		return loans.map((l) => ({
			...l,
			sale: loansNum.includes(String(l.loan_num)),
		}));
	}
);
