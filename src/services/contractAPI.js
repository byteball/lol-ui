import { ethers, formatUnits, parseUnits } from "ethers";
import moment from "moment";
import Big from 'big.js';

import LineAbi from "@/abi/Line.json";
import LoanNFTAbi from "@/abi/LoanNFT.json";
import EquilibrePairAbi from "@/abi/EquilibrePair.json";
import BorrowViaEquilibreAbi from "@/abi/BorrowViaEquilibre.json";

import appConfig from "@/appConfig";
import { changeNetwork, getTokenPrice } from "@/utils";
import { store } from "..";

import { saveAddressAndLoadLoans } from "@/store/thunks/saveAddressAndLoadLoans";
import { addWatchedAddress } from "@/store/slices/settingsSlice";
import { provider } from "./provider";
import {
	BUY_ORDER,
	SELL_ORDER,
} from "@/components/organisms/OrdersScatterChart/OrdersScatterChart";

const MAX_UINT256 = 2n ** 256n - 1n;

class contractsAPI {
	constructor() { }

	getSigner() {
		if (window.ethereum) {
			const provider = this.getBrowserProvider();

			return provider.getSigner();
		} else {
			throw "No metamask";
		}
	}

	getBrowserProvider() {
		return new ethers.BrowserProvider(window.ethereum);
	}

	async changeNetwork() {
		const provider = this.getBrowserProvider();

		const currentNetwork = await provider.getNetwork();

		if (currentNetwork.chainId !== BigInt(appConfig.RPC_META.chainId)) {
			await changeNetwork();
		}
	}

	async approve(amount, tokenAddress, contractAddress) {
		const state = store.getState();

		if (tokenAddress === ethers.ZeroAddress) return;

		const token = tokenAddress || state.settings.collateralTokenAddress;
		const signer = await this.getSigner();

		const sender_address = await signer.getAddress();

		const tokenContract = new ethers.Contract(token, LineAbi, signer);

		const allowance = await tokenContract.allowance(
			sender_address,
			contractAddress || appConfig.CONTRACT
		);

		if (allowance <= BigInt(String(amount))) {
			const approval_res = await tokenContract.approve(
				contractAddress || appConfig.CONTRACT,
				MAX_UINT256
			);

			await approval_res.wait();
		}
	}

	async addToken() {
		const state = store.getState();
		const signer = await this.getSigner();
		const address = await signer.getAddress();

		const symbol = state.settings.symbol;
		const decimals = state.settings.decimals;
		const assetWatched = state.settings.addressesWatchedAsset.includes(address);

		if (assetWatched) return;

		const params = {
			type: "ERC20",
			options: {
				address: appConfig.CONTRACT,
				symbol,
				decimals,
				image: `${appConfig.ICON_CDN_URL}/${String(symbol).toUpperCase()}.svg`,
			},
		};

		const wasAdded = await window.ethereum.request({
			method: "wallet_watchAsset",
			params,
		});

		if (wasAdded) {
			store.dispatch(addWatchedAddress(address));
		}
	}

	async checkAddress() {
		const state = store.getState();

		if (state.settings.walletAddress) {
			const signer = await this.getSigner();
			const address = await signer.getAddress();

			if (
				address.toLowerCase() !== state.settings.walletAddress.toLowerCase()
			) {
				throw { code: "another-user" };
			}
		}

		return true;
	}

	async borrow(collateralAmount) {
		await this.changeNetwork();

		const signer = await this.getSigner();
		const state = store.getState();

		if (!state.settings.walletAddress) {
			const address = await signer.getAddress();

			store.dispatch(saveAddressAndLoadLoans(address));
		} else {
			const isUserAddress = await this.checkAddress();

			if (!isUserAddress) return;
		}

		await this.addToken();
		await this.approve(collateralAmount);

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, signer);
		await contract.borrow(collateralAmount);
	}

	async borrowViaEquilibre(assetIn, amountIn, amountOutMin, routes) {
		await this.changeNetwork();

		const signer = await this.getSigner();
		const state = store.getState();

		if (!state.settings.walletAddress) {
			const address = await signer.getAddress();

			store.dispatch(saveAddressAndLoadLoans(address));
		} else {
			const isUserAddress = await this.checkAddress();

			if (!isUserAddress) return;
		}

		await this.addToken();

		await this.approve(amountIn, assetIn, appConfig.EQUILIBRE_SWAP_AND_BORROW_CONTRACT);

		const helperContract = new ethers.Contract(appConfig.EQUILIBRE_SWAP_AND_BORROW_CONTRACT, BorrowViaEquilibreAbi, signer);

		if (assetIn === ethers.ZeroAddress) {
			await helperContract.swapAndBorrow(BigInt(amountIn), BigInt(amountOutMin), routes, Number(moment().unix() + 10 * 60 * 100).toString(), {
				value: BigInt(amountIn)
			});
		} else {
			await helperContract.swapAndBorrow(BigInt(amountIn), BigInt(amountOutMin), routes, BigInt(Number(moment().unix() + 10 * 60 * 100).toString()));
		}
	}


	async repay(loan_num) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, signer);
		await contract.repay(BigInt(String(loan_num)));
	}

	async getLoansByUserAddress(address) {
		const state = store.getState();
		const nftLoansContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			provider
		);

		const loans = await nftLoansContract.getAllActiveLoansByOwner(address);

		return loans
			.toArray()
			.map(
				([
					loan_num,
					collateral_amount,
					loan_amount,
					current_loan_amount,
					interest_multiplier,
					initial_owner,
					ts,
				]) => ({
					loan_num: +loan_num.toString(),
					collateral_amount: collateral_amount.toString(),
					loan_amount: loan_amount.toString(),
					current_loan_amount: current_loan_amount.toString(),
					interest_multiplier: interest_multiplier.toString(),
					initial_owner,
					ts: +ts.toString(),
				})
			);
	}

	async getUserTokensBalance(userAddress, tokens = []) {
		if (!userAddress) return {};

		const balances = {};

		const getters = tokens.map(async (address) => {
			const tokenContract = new ethers.Contract(address, LineAbi, provider);
			const balance = await tokenContract
				.balanceOf(userAddress)
				.then((balance) => balance.toString())
				.catch(() => "0");

			balances[address] = balance;
		});

		await Promise.all(getters);

		return balances;
	}

	async getLoanByNum(num) {
		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			provider
		);

		const loansData = await nftContract
			.loans(num)
			.then((data) => data.toArray());

		const [
			collateral_amount,
			loan_amount,
			interest_multiplier,
			initial_owner,
			ts,
		] = loansData;

		return {
			collateral_amount: collateral_amount.toString(),
			loan_amount: loan_amount.toString(),
			interest_multiplier: interest_multiplier.toString(),
			initial_owner,
			ts: ts.toString(),
		};
	}

	async getCurrentInterestMultiplier() {
		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, provider);

		return contract.interest_multiplier().then((m) => m.toString());
	}

	/*** Staking ***/

	async getApyByPool({
		collateralTokenPrice,
		totalStakedInPoolE18,
		tokenPriceInUSD,
		reward_share10000,
	}) {
		const state = store.getState();

		const lineContract = new ethers.Contract(
			appConfig.CONTRACT,
			LineAbi,
			provider
		);

		const totalDebt = await lineContract.total_debt().then((d) => Big(d).mul(1e-18).toNumber());

		const totalRewardPerYear = Big(state.params.interestRate).mul(totalDebt).toNumber();

		const linePriceInCollateralE18 = await lineContract.getCurrentInterestMultiplier();
		
		const poolRewardPerYear = totalRewardPerYear * Big(reward_share10000).mul(1e-4).toNumber();

		const poolRewardPerYearInUSD = Big(poolRewardPerYear).mul(collateralTokenPrice).mul(linePriceInCollateralE18).mul(1e-18).toNumber();
		
		if (!tokenPriceInUSD) return 0;

		return poolRewardPerYearInUSD / (Big(totalStakedInPoolE18).mul("1e-18").mul(tokenPriceInUSD)).toNumber();
	}

	async getAllPools({ collateralTokenPrice }) {
		const state = store.getState();

		const lineContract = new ethers.Contract(
			appConfig.CONTRACT,
			LineAbi,
			provider
		);

		const poolsData = await lineContract.getAllPools();

		const pools = [...poolsData].map(
			([
				[
					exists,
					reward_share10000,
					last_total_reward,
					total_pool_reward_per_token,
					total_staked_in_pool,
				],
				poolContractAddress,
			]) => ({
				address: poolContractAddress,
				exists,
				reward_share10000: reward_share10000.toString(),
				lastTotalReward: last_total_reward.toString(),
				totalPoolRewardPerToken: total_pool_reward_per_token.toString(),
				totalStakedInPool: total_staked_in_pool.toString(),
			})
		);

		const poolMetaGetters = pools.map(
			async (
				{ address, reward_share10000, totalStakedInPool: totalStakedInPoolE18 },
				index
			) => {
				const tokenContract = new ethers.Contract(
					address,
					EquilibrePairAbi,
					provider
				);

				const getters = [
					tokenContract
						.decimals()
						.then((d) => +d.toString())
						.then((decimals) => (pools[index].decimals = decimals))
						.catch(() => (pools[index].decimals = 18)),
				];

				let isPool = false;

				try {
					isPool = await tokenContract.token1().then(() => true);
				} catch (err) {
					console.log(err);
				}

				let tokenSymbol = await tokenContract.symbol().catch(() => "NO SYMBOL");

				pools[index].isPool = isPool;

				if (isPool) {
					const [token0, token1, totalSupply, getReserves] = await Promise.all([
						tokenContract.token0(),
						tokenContract.token1(),
						tokenContract.totalSupply(),
						tokenContract.getReserves(),
					]);

					pools[index].token0 = token0;
					pools[index].token1 = token1;

					const contract0 = new ethers.Contract(token0, LineAbi, provider);
					const contract1 = new ethers.Contract(token1, LineAbi, provider);

					const [symbol0, symbol1] = await Promise.all([
						contract0.symbol(),
						contract1.symbol(),
					]);

					const p0 = parseUnits((await getTokenPrice(token0, state.params.oracle)).toFixed(9), 9);

					const lpBigIntPriceInUSD =
						(2n * getReserves[0] * BigInt(String(p0))) / totalSupply;

					pools[index].tokenPriceInUSD = +formatUnits(lpBigIntPriceInUSD, 9);

					pools[index].symbol = tokenSymbol ? tokenSymbol : `${symbol0}-${symbol1}`;
				} else {
					pools[index].symbol = tokenSymbol;
					pools[index].tokenPriceInUSD = await getTokenPrice(address, state.params.oracle);
				}

				if (totalStakedInPoolE18 !== "0") {
					pools[index].apy = await this.getApyByPool({
						collateralTokenPrice,
						totalStakedInPoolE18,
						tokenPriceInUSD: pools[index].tokenPriceInUSD,
						reward_share10000,
					});
				} else {
					pools[index].apy = 0;
				}

				return Promise.all(getters);
			}
		);

		await Promise.all(poolMetaGetters);

		return pools;
	}

	async getStakingPoolByAddress(address) {
		if (!address) return [];

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, provider);

		const pools = await contract.getUserPools(address).then((pools = []) =>
			[...pools].map(([address, reward_share10000, stake, reward]) => ({
				address,
				reward_share: formatUnits(reward_share10000, 4),
				stake: stake.toString(),
				reward: reward.toString(),
			}))
		);

		return pools;
	}

	async stake(pool_address, amount) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();

		if (!isUserAddress) {
			return;
		}

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, signer);

		await this.approve(amount, pool_address);

		await contract.stake(pool_address, amount);
	}

	async unstake(pool_address, amount = BigInt(0), claimReward = false) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, signer);

		if (claimReward) {
			await contract.unstakeAndClaim(pool_address, amount);
		} else {
			await contract.unstake(pool_address, amount);
		}
	}

	async claimReward(pool_address) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, signer);

		await contract.claim(pool_address);
	}

	// Marketplace

	async getSellOrders() {
		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			provider
		);

		return await nftContract.getSellOrders().then((data) =>
			data
				.toArray()
				.map(
					([
						user,
						price,
						price_contract,
						data,
						current_price,
						current_hedge_price,
						loan_num,
						collateral_amount,
						current_loan_amount,
						strike_price,
					]) => ({
						user,
						price: price.toString(),
						price_contract,
						data,
						current_price: current_price.toString(),
						current_hedge_price: current_hedge_price.toString(),
						loan_num: loan_num.toString(),
						collateral_amount: collateral_amount.toString(),
						current_loan_amount: current_loan_amount.toString(),
						strike_price: strike_price.toString(),
						type: SELL_ORDER,
					})
				)
		);
	}

	async getBuyOrders() {
		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			provider
		);

		return await nftContract.getBuyOrders().then((data) =>
			data
				.toArray()
				.map(
					([
						user,
						buy_order_id,
						amount,
						strike_price,
						hedge_price,
						_,
						__,
						current_hedge_price,
					]) => ({
						user,
						buy_order_id: buy_order_id.toString(),
						amount: amount.toString(),
						strike_price: strike_price.toString(),
						hedge_price: hedge_price.toString(),
						current_hedge_price: current_hedge_price.toString(),
						type: BUY_ORDER,
					})
				)
		);
	}

	async createSellOrder(loan_num, price) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			signer
		);

		await this.approve(BigInt(String(price)));

		await nftContract.createSellOrder(
			BigInt(String(loan_num)),
			BigInt(String(price)),
			ethers.ZeroAddress,
			"0x"
		);
	}

	async createBuyOrder(amount, strike_price, hedge_price) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			signer
		);

		await this.approve(BigInt(String(amount)), state.settings.collateralTokenAddress, state.settings.loanNFTAddress);

		await nftContract.createBuyOrder(
			BigInt(String(amount)),
			BigInt(String(strike_price)),
			BigInt(String(hedge_price)),
			ethers.ZeroAddress,
			"0x"
		);
	}

	async buyLoan(loan_num, max_price) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			signer
		);

		await this.approve(
			BigInt(String(max_price)),
			null,
			state.settings.loanNFTAddress
		);

		await nftContract.buy(BigInt(String(loan_num)), BigInt(String(max_price)));
	}

	async sellLoan(loan_num, buy_order_id, min_price) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			signer
		);

		await nftContract.sell(
			BigInt(String(loan_num)),
			BigInt(String(buy_order_id)),
			BigInt(String(min_price))
		);
	}

	async cancelOrder(type, numOrID) {
		await this.changeNetwork();

		const signer = await this.getSigner();

		const isUserAddress = await this.checkAddress();
		if (!isUserAddress) return;

		const state = store.getState();

		const nftContract = new ethers.Contract(
			state.settings.loanNFTAddress,
			LoanNFTAbi,
			signer
		);

		if (type === "buy") {
			await nftContract.cancelBuyOrder(String(numOrID));
		} else if (type === "sell") {
			await nftContract.cancelSellOrder(String(numOrID));
		}
	}
}

export default new contractsAPI();
