// TODO: Fix DATA; Take for mainnet from coingeco

export const getTokenPrice = async (tokenAddress) => {
	if (tokenAddress === "0x326C977E6efc84E512bB9C30f76E30c160eD06FB") {
		// LINK
		return 0.123;
	} else if (tokenAddress === "0x5B67676a984807a212b1c59eBFc9B3568a474F0a") {
		// WMATIC
		return 0.94;
	} else if ("0xeA9E7c046c6E4635F9A71836fF023c8f45948433") {
		// GBYTE
		return 10.123;
	}
};
