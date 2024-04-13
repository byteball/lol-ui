import { ethers, formatUnits } from "ethers";

import { provider } from "./services/provider";
import appConfig from "./appConfig";

import LineAbi from "./abi/Line.json";
import LoanNFTAbi from "./abi/LoanNFT.json";

import { store } from ".";
import { saveFirstInitedData } from "./store/slices/settingsSlice";
import { updateParams } from "./store/slices/paramsSlice";
import { saveAddressAndLoadLoans } from "./store/thunks/saveAddressAndLoadLoans";
import { loadStakingPools } from "@/store/thunks/loadStakingPools";
import { loadUserBalance } from "@/store/thunks/loadUserBalance";
import { loadMarketOrders } from "@/store/thunks/loadMarketOrders";

import {
	BoughtLoanEvent,
	CancelBuyOrderEvent,
	CancelSellOrderEvent,
	ClaimEvent,
	FilledBuyOrderEvent,
	NewBuyOrderEvent,
	NewLoanEvent,
	NewSellOrderEvent,
	RepaidEvent,
	SoldLoanEvent,
	StakeEvent,
	TransferLoanNftEvent,
	UnstakeEvent,
} from "./events";

export const bootstrap = async () => {
	const state = store.getState();

	const contract = new ethers.Contract(appConfig.CONTRACT, LineAbi, provider);
	let collateralTokenAddress = state.settings.collateralTokenAddress;
	let loanNFTContractAddress = state.settings.loanNFTAddress;

	if (!state.settings.firstInited) {
		console.log("log: load inited data");
		collateralTokenAddress = await contract.collateral_token_address();

		const collateralTokenContract = new ethers.Contract(
			collateralTokenAddress,
			LineAbi,
			provider
		);

		const [
			collateralDecimals,
			collateralSymbol,
			symbol,
			decimals,
			loanNFTAddress,
		] = await Promise.all([
			collateralTokenContract
				.decimals()
				.then((decimals) => +decimals.toString()),
			collateralTokenContract.symbol(),
			contract.symbol(),
			contract.decimals().then((decimals) => +decimals.toString()),
			contract.loanNFT(),
		]);

		loanNFTContractAddress = loanNFTAddress;

		store.dispatch(
			saveFirstInitedData({
				collateralSymbol,
				collateralDecimals,
				collateralTokenAddress,
				symbol,
				decimals,
				loanNFTAddress,
			})
		);
	}

	store.dispatch(loadMarketOrders());

	const NFTLoanContract = new ethers.Contract(
		loanNFTContractAddress,
		LoanNFTAbi,
		provider
	);

	const [originationFee, interestRate, totalRewardShare, oracle, exchangeFee] =
		await Promise.all([
			contract.origination_fee10000().then((fee) => +formatUnits(fee, 4)),
			contract.interest_rate10000().then((fee) => +formatUnits(fee, 4)),
			contract
				.total_reward_share10000()
				.then((share) => +formatUnits(share, 4)),
			contract.oracle(),
			NFTLoanContract.exchange_fee10000().then((fee) => +formatUnits(fee, 4)),
		]);

	store.dispatch(
		updateParams({
			originationFee,
			interestRate,
			totalRewardShare,
			oracle,
			exchangeFee,
		})
	);

	if (state.settings.walletAddress) {
		store.dispatch(saveAddressAndLoadLoans(state.settings.walletAddress));
	}

	if (Number(state.pools.updatedAt) < Date.now() - 1800 * 1000) {
		console.log("log: update staking pool list");
		store.dispatch(loadStakingPools());
	} else if (state.settings.walletAddress) {
		store.dispatch(loadUserBalance());
	}

	console.log("log: subscription to contract events");

	// loans
	contract.on("NewLoan", NewLoanEvent);
	contract.on("Repaid", RepaidEvent);

	// staking
	contract.on("Staked", StakeEvent);
	contract.on("Unstaked", UnstakeEvent);
	contract.on("Claimed", ClaimEvent);

	// market

	NFTLoanContract.on("CanceledSellOrder", CancelSellOrderEvent);
	NFTLoanContract.on("CanceledBuyOrder", CancelBuyOrderEvent);

	NFTLoanContract.on("Bought", BoughtLoanEvent);
	NFTLoanContract.on("Sold", SoldLoanEvent);

	NFTLoanContract.on("NewSellOrder", NewSellOrderEvent);
	NFTLoanContract.on("NewBuyOrder", NewBuyOrderEvent);

	NFTLoanContract.on("FilledBuyOrder", FilledBuyOrderEvent);

	NFTLoanContract.on("Transfer", TransferLoanNftEvent); // ERC721 event

	console.log("log: connect time", new Date().toLocaleString());
};
