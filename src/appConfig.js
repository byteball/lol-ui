export default {
	TESTNET: import.meta.env.VITE_TESTNET === "1",
	CONTRACT: import.meta.env.VITE_CONTRACT,
	ICON_CDN_URL: import.meta.env.VITE_ICON_CDN_URL,
	MAX_VIEW_DECIMALS: 6,
	EQUILIBRE_ROUTER_CONTRACT: import.meta.env.VITE_EQUILIBRE_ROUTER_CONTRACT,
	EQUILIBRE_SWAP_AND_BORROW_CONTRACT: import.meta.env.VITE_EQUILIBRE_SWAP_AND_BORROW_CONTRACT,
	GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID,
	USDT_CONTRACT: import.meta.env.VITE_USDT_CONTRACT,
	PAIR_FACTORY_ADDRESS: import.meta.env.VITE_PAIR_FACTORY_ADDRESS,
	WKAVA_ADDRESS: import.meta.env.VITE_WKAVA_ADDRESS,
	SLIPPAGE_TOLERANCE_PERCENT: 3,
	DISABLED_POOL_ADDRESSES: [
		"0xFb1Efb5FD9dfb72f40B81bC5aa0e15d616BA8831", // vAMM-GBYTE/LINE
		"0xb253c4f9b615C20D9DE12bF317c71f896eb361A7" // vAMM-LINE/USDt
	],
	RPC_META:
		import.meta.env.VITE_TESTNET === "1"
			? {
				chainId: "0x13881",
				chainName: "Polygon TEST Network",
				nativeCurrency: {
					name: "MATIC",
					symbol: "MATIC",
					decimals: 18,
				},
				rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
				blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
			}
			: {
				chainId: "0x8ae",
				chainName: "Kava EVM Network",
				nativeCurrency: {
					name: "KAVA",
					symbol: "KAVA",
					decimals: 18,
				},
				rpcUrls: ["https://evm.kava.io"],
				blockExplorerUrls: ["https://explorer.kava.io/"],
			},
	titles: {
		default: "LINE — a price-protected token",
		staking: "LINE token — Staking",
		market: "LINE token — Market",
		about: "LINE token — About us",
		faq: "LINE token — F.A.Q."
	}
};
