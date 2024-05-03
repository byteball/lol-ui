import axios from "axios";

import { getLinePrice } from "./getLinePrice";

import appConfig from "@/appConfig";
import { store } from "..";

export const getTokenPriceInUSD = async (tokenAddress, lineOracle, _collateralTokenPrice = 0) => {
	if (tokenAddress === appConfig.CONTRACT) {
		const linePriceInCollateralTokens = await getLinePrice(lineOracle);

		if (_collateralTokenPrice) {
			return linePriceInCollateralTokens * _collateralTokenPrice;
		} else {
			const state = store.getState();
			const collateralTokenAddress = state.settings.collateralTokenAddress;

			const collateralTokenPrice = await getTokenPriceInUSD(collateralTokenAddress);

			return linePriceInCollateralTokens * collateralTokenPrice;
		}
	}

	if (appConfig.TESTNET) return 0;

	const coingeckoPrice = await axios.get(`https://api.coingecko.com/api/v3/coins/kava/contract/${tokenAddress.toLowerCase()}`)
		.then(data => data?.data?.market_data?.current_price?.usd || null).catch(() => null);

	if (coingeckoPrice !== null) return coingeckoPrice;

	console.log(`log: can't get price of ${tokenAddress}`)

	return 0;
};
