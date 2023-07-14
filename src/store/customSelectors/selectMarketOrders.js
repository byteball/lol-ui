import { createDraftSafeSelector } from "@reduxjs/toolkit";

import {
	selectBuyMarketOrders,
	selectSellMarketOrders,
} from "@/store/slices/marketSlice";

export const selectMarketOrders = createDraftSafeSelector(
	selectBuyMarketOrders,
	selectSellMarketOrders,
	(buyOrders, sellOrders) => [...buyOrders, ...sellOrders]
);
