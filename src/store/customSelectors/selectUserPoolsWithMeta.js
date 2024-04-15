import { createDraftSafeSelector } from "@reduxjs/toolkit";

import { selectAllPools, selectUserPools } from "@/store/slices/poolsSlice";

export const selectUserPoolsWithMeta = createDraftSafeSelector(
	selectUserPools,
	selectAllPools,
	(userPools, allPools) =>
		userPools
			.map(({ ...data }) => {
				const meta = allPools.find(
					({ address }) => address.toLowerCase() === data.address.toLowerCase()
				);

				if (!meta) return null;

				return {
					...data,
					symbol: meta.symbol,
					decimals: meta.decimals,
					tokenPriceInUSD: meta.tokenPriceInUSD,
					apy: meta.apy,
					isPool: meta.isPool
				};
			})
			.filter((p) => !!p && (p.stake !== "0" || p.reward !== "0"))
);
