import appConfig from "../appConfig";

export const addToken = async () => {
	if (!window.ethereum)
		// no metamask installed
		return;

	const address = await signer.getAddress();
	const symbol = selectedDestination.token.symbol;
	const destinationChainId =
		chainIds[environment][selectedDestination.token.network];

	const params = {
		type: "ERC20",
		options: {
			address: selectedDestination.dst_bridge_aa,
			symbol,
			decimals: selectedDestination.token.decimals,
			image: `${appConfig.ICON_CDN_URL}/${String(symbol).toUpperCase()}.svg`,
		},
	};

	if (
		chainId === destinationChainId &&
		!(
			addedTokens[address]?.[chainId] &&
			addedTokens[address]?.[chainId]?.includes(symbol)
		)
	) {
		const wasAdded = await window.ethereum.request({
			method: "wallet_watchAsset",
			params,
		});
		if (wasAdded) {
			dispatch(addTokenToTracked({ address, chainId, symbol }));
		}
	} else if (!pendingTokens[destinationChainId]) {
		setPendingTokens({ ...pendingTokens, [destinationChainId]: [params] });
	} else if (
		pendingTokens[destinationChainId] &&
		!pendingTokens[destinationChainId].find(
			(t) => t.options.symbol === params.options.symbol
		)
	) {
		setPendingTokens({
			...pendingTokens,
			[destinationChainId]: [...pendingTokens[destinationChainId], params],
		});
	}
};
