import appConfig from "@/appConfig";
import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { loadUserBalance } from "../thunks/loadUserBalance";

const persistConfig = {
	key: `line-ui-settings`,
	keyPrefix: appConfig.TESTNET ? "testnet:" : "livenet:",
	version: 1,
	storage,
	blacklist: ["walletBalance", "collateralTokenPrice"],
};

export const settingsSlice = createSlice({
	name: "settings",
	initialState: {
		walletAddress: null,
		walletBalance: {},
		loadingWalletBalance: true,
		firstInited: false,
		collateralSymbol: null,
		collateralDecimals: null,
		collateralTokenPrice: null,
		collateralTokenAddress: null,
		symbol: null,
		decimals: null,
		loanNFTAddress: null,
		addressesWatchedAsset: [],
	},
	reducers: {
		saveFirstInitedData: (state, action) => {
			state.firstInited = true;

			const {
				collateralSymbol,
				collateralDecimals,
				collateralTokenAddress,
				symbol,
				decimals,
				loanNFTAddress,
			} = action.payload;

			state.collateralSymbol = collateralSymbol;
			state.collateralDecimals = collateralDecimals;
			state.collateralTokenAddress = collateralTokenAddress;
			state.symbol = symbol;
			state.decimals = decimals;
			state.loanNFTAddress = loanNFTAddress;
		},
		addWatchedAddress: (state, action) => {
			state.addressesWatchedAsset.push(action.payload);
		},
		logout: (state) => {
			state.walletAddress = null;
			state.walletBalance = {};
		},
		saveWalletAddress: (state, action) => {
			state.walletAddress = action.payload;
		},
		loadingWalletBalance: (state) => {
			state.loadingWalletBalance = true;
			state.walletBalance = [];
		},
		updateCollateralTokenPrice: (state, action) => {
			state.collateralTokenPrice = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(loadUserBalance.fulfilled, (state, action) => {
			state.walletBalance = action.payload;
		});
	},
});

export const {
	saveFirstInitedData,
	addWatchedAddress,
	logout,
	saveWalletAddress,
	loadingWalletBalance,
	updateCollateralTokenPrice,
} = settingsSlice.actions;

export default persistReducer(persistConfig, settingsSlice.reducer);

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectWalletAddress = (state) => state.settings.walletAddress;
export const selectWalletBalance = (state) => state.settings.walletBalance;

export const selectSymbol = (state) => state.settings.symbol;
export const selectDecimals = (state) => state.settings.decimals;

export const selectCollateralSymbol = (state) =>
	state.settings.collateralSymbol;
export const selectCollateralDecimals = (state) =>
	state.settings.collateralDecimals;
export const selectCollateralTokenAddress = (state) =>
	state.settings.collateralTokenAddress;
export const selectWasFirstInited = (state) => state.settings.firstInited;
export const selectLoanNFTAddress = (state) => state.settings.loanNFTAddress;
