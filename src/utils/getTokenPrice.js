import axios from "axios";

import { getLinePrice } from "./getLinePrice";

import appConfig from "@/appConfig";

export const getTokenPrice = async (tokenAddress, lineOracle) => {

	if (tokenAddress === appConfig.CONTRACT) return await getLinePrice(lineOracle);
	
	const coingetckoPrice = await axios.get(`https://api.coingecko.com/api/v3/coins/kava/contract/${tokenAddress.toLowerCase()}`)
		.then(data => data?.data?.market_data?.current_price?.usd || null).catch(() => null);

	if (coingetckoPrice !== null) return coingetckoPrice;

	console.log(`log: can't get price of ${tokenAddress}`)
};
