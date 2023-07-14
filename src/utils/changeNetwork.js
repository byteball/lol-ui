import appConfig from "@/appConfig";

export const changeNetwork = async () => {
	return await window.ethereum
		.request({
			method: "wallet_switchEthereumChain",
			params: [
				{ chainId: `0x${Number(appConfig.RPC_META.chainId).toString(16)}` },
			],
		})
		.catch(async (switchError) => {
			if (switchError.code === 4902) {
				await window.ethereum.request({
					method: "wallet_addEthereumChain",
					params: [appConfig.RPC_META],
				});

				await window.ethereum
					.request({
						method: "wallet_switchEthereumChain",
						params: [
							{
								chainId: `0x${Number(appConfig.RPC_META.chainId).toString(16)}`,
							},
						],
					})
					.catch((e) => {
						throw new Error("wallet_switchEthereumChain error", e);
					});

				return Promise.resolve();
			} else {
				throw new Error("wallet_switchEthereumChain error");
			}
		});
};
