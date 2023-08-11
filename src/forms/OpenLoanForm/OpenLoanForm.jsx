import { useEffect, useRef, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers, parseUnits } from "ethers";
import ReactGA from "react-ga4";

import { Input, Select } from "@/components/atoms";
import { MetaMaskButton, QuestionTooltip } from "@/components/molecules";

import {
	selectCollateralSymbol,
	selectCollateralTokenAddress,
	selectSymbol,
} from "@/store/slices/settingsSlice";
import { selectParams } from "@/store/slices/paramsSlice";
import { sendNotification } from "@/store/thunks/sendNotification";

import contractAPI from "@/services/contractAPI";
import {
	toLocalString,
	getCountOfDecimals,
	recognizeMetamaskError,
	getAmountIn
} from "@/utils";
import { selectLinePrice } from "@/store/slices/priceSlice";

import { useLazyEffect } from "@/hooks";
import { selectDecimalsByToken } from "@/store/slices/cacheSlice";

import appConfig from "@/appConfig";

const INIT_COLLATERAL = 1;

const getLoanAmount = (collateralAmount, oracle, price) => {
	if (oracle === ethers.ZeroAddress) {
		return collateralAmount * 1000;
	} else {
		return collateralAmount / price;
	}
};

export const OpenLoanForm = () => {
	const [collateral, setCollateral] = useState({ value: "", valid: true });
	const [loan, setLoan] = useState({ value: "", valid: true });
	const [loading, setLoading] = useState(false);
	const [inputToken, setInputToken] = useState({ value: null, loading: false, amount: null, rate: 0 });
	const btnRef = useRef();
	const dispatch = useDispatch();

	const symbol = useSelector(selectSymbol);
	const collateralSymbol = useSelector(selectCollateralSymbol);
	const collateralTokenAddress = useSelector(selectCollateralTokenAddress);

	const price = useSelector(selectLinePrice);
	const params = useSelector(selectParams);
	const decimalsByToken = useSelector(selectDecimalsByToken);

	const { originationFee, interestRate } = useSelector(selectParams);

	const inputTokenList = useMemo(() => !appConfig.TESTNET ? [
		{
			value: collateralTokenAddress,
			label: collateralSymbol,
			decimals: 18
		},
		{
			value: ethers.ZeroAddress,
			label: "KAVA",
			decimals: 18
		},
		{
			value: appConfig.USDT_CONTRACT,
			label: "USDT",
			decimals: 6
		}
	] : [
		{
			value: collateralTokenAddress,
			label: collateralSymbol,
		}
	], [collateralTokenAddress, collateralSymbol]);

	const handleKeyDown = (ev) => {
		if (ev.code === "Enter" || ev.code === "NumpadEnter") {
			btnRef.current.click();
		}
	};

	useEffect(() => {
		handleCollateralChange(null, Number(collateral.value) || INIT_COLLATERAL);
	}, [price]);


	useEffect(() => {
		if (inputToken.value === null) {
			setInputToken({ ...inputToken, value: collateralTokenAddress, symbol: collateralSymbol });
		}
	}, [collateralTokenAddress, collateralSymbol]);


	const handleCollateralChange = (ev, v) => {
		const value = v || ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setCollateral({ value: "0.", valid: false });
		} else if (getCountOfDecimals(value) <= 18 && value <= 1e6) {
			setCollateral({ value, valid });

			if (valid) {
				const loanAmount = getLoanAmount(Number(value), params.oracle, price);

				setLoan({ value: loanAmount, valid: true });

				if (collateralTokenAddress && inputToken.value && inputToken.value.toLowerCase() !== collateralTokenAddress.toLowerCase()) {
					setInputToken({ ...inputToken, loading: true, amount: null, rate: 0 });
				}
			} else {
				setLoan({ value: 0, valid: false });
			}
		}
	};

	let netLoanAmount = 0;

	if (loan.valid) {
		netLoanAmount = loan.value - loan.value * originationFee;
	}

	const originationFeeAmount = Number(loan.value) - netLoanAmount;

	const openLoan = async () => {
		try {
			setLoading(true);

			if (inputToken.value !== collateralTokenAddress) {
				const inputTokenDecimals = inputToken.value !== ethers.ZeroAddress ? +decimalsByToken[inputToken.value.toLowerCase()] : 18;

				await contractAPI.borrowViaEquilibre(inputToken.value, parseUnits(Number(inputToken.amount).toFixed(inputTokenDecimals), BigInt(String(inputTokenDecimals))).toString(), parseUnits(Number(collateral.value * ((100 - appConfig.SLIPPAGE_TOLERANCE_PERCENT) / 100)).toFixed(18), BigInt("18")).toString(), inputToken.route);

				ReactGA.event({
					category: "loan",
					action: "open_loan",
					value: collateral.value,
					label: 'via equilibre',
					transport: "xhr"
				});
			} else {
				await contractAPI.borrow(parseUnits(collateral.value.toString()));

				ReactGA.event({
					category: "loan",
					action: "open_loan",
					value: collateral.value,
					transport: "xhr"
				});
			}

			dispatch(
				sendNotification({
					title: "Transaction successful",
					type: "success",
				})
			);

		} catch (error) {
			console.log("openLoan error: ", error)
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setLoading(false);
		}
	};

	const handleChangeInputToken = (value) => {
		const inputToken = inputTokenList.find((item) => item.value === value);
		const symbol = inputToken.label;

		setInputToken({ value, loading: true, symbol, amount: null, decimals: inputToken.decimals || 18 });
	}

	useLazyEffect(() => {
		if (inputToken.value !== collateralTokenAddress && Number(collateral.value) > 0) {

			getAmountIn(inputToken.value, collateralTokenAddress, collateral.value, collateral.value).then(([amount, route]) => {
				if (amount > 0) {
					const rate = amount / collateral.value;
					setInputToken({ ...inputToken, loading: false, amount, rate, route });
				} else {
					setInputToken({ ...inputToken, loading: false, amount: null, rate: 0, route });
				}
			});
		} else {
			setInputToken({ ...inputToken, loading: false, amount: null, rate: 0, route: [] });
		}
	}, [inputToken.value, collateralTokenAddress, collateral], 600);


	return (
		<>
			<div className="flex flex-wrap justify-between sm:space-x-4 sm:flex-nowrap">
				<div className="basis-full sm:basis-4/6">
					<Input
						label="Collateral amount"
						autoFocus={true}
						disabled={loading}
						value={collateral.value}
						error={!!collateral.value && !collateral.valid}
						labelDescription="The collateral you put in exchange for borrowing the LINE tokens. You can always repay the loan (plus interest) and get your collateral back."
						className="mb-3"
						placeholder=""
						suffix={collateralSymbol}
						onChange={handleCollateralChange}
						onKeyDown={handleKeyDown}
					/>
				</div>
				<div className="mb-3 basis-full sm:basis-2/6 sm:mb-0">
					<Select
						label="Pay with"
						value={inputToken.value}
						disabled={inputToken.loading && inputToken.value !== collateralTokenAddress}
						labelDescription="If you pay with any token different from GBYTE, your payment token will be first swapped into GBYTE via Equilibre DEX, then sent to open a new loan."
						onChange={handleChangeInputToken}
					>
						{inputTokenList.map((item) => (<Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>))}
					</Select>
				</div>
			</div>

			<div className="mb-2">
				<div className="block mb-1 text-sm font-medium text-white/60">
					Interest rate{" "}
					<QuestionTooltip description="Yearly interest charged for holding the loan" />
					<span className="ml-1 text-gray-300">
						{+Number(interestRate * 100).toFixed(2)}%
					</span>
				</div>

				<div className="block mb-1 text-sm font-medium text-white/60">
					Loan amount{" "}
					<QuestionTooltip description="The initial amount of your loan. It will slowly grow as interest accrues." />{" "}
					<span className="ml-1 text-gray-300">
						{toLocalString(loan.value)}{" "}
						<small>{symbol}</small>
					</span>
				</div>
				<div className="block mb-1 text-sm font-medium text-white/60">
					Origination fee{" "}
					<QuestionTooltip
						description={`Fee charged for creating the loan: ${+Number(
							params.originationFee * 100
						).toFixed(2)}%`}
					/>{" "}
					<span className="ml-1 text-gray-300">
						{toLocalString(originationFeeAmount)}{" "}
						<small>{symbol}</small>
					</span>
				</div>

				{inputToken.value !== collateralTokenAddress && <div className="block mb-1 text-sm font-medium text-white/60">
					Slippage tolerance
					<span className="ml-1 text-gray-300">
						{appConfig.SLIPPAGE_TOLERANCE_PERCENT}%
					</span>
				</div>}

				{inputToken.value !== collateralTokenAddress && Number(collateral.value) ? <div className="block mb-1 text-sm font-medium text-white/60">
					Swap rate{" "}
					<QuestionTooltip
						description={`${collateralSymbol}s are first bought with ${inputToken.symbol}, then sent to open a loan. Please make sure the exchange rate matches your expectations, it can be off the market rate if there is little liquidity on the DEX.`}
					/>{" "}
					{!inputToken.loading ? <>
						{Number(inputToken.amount) > 0 ? <span className="ml-1 text-gray-300">
							1 <small>{collateralSymbol}</small> = {toLocalString(inputToken.rate)}{" "}
							<small>{inputToken.symbol}</small>
						</span> : <span className="ml-1 text-red-900">Error, try a smaller amount</span>}
					</> : <span className="ml-1 text-gray-300">loading...</span>}
				</div> : null}
			</div>

			<div className="mb-5 text-white/80">
				You get:{" "}
				{loan.value && loan.valid ? toLocalString(netLoanAmount) : 0}{" "}
				<small>{symbol}</small>
			</div>

			<div className="text-center">
				<MetaMaskButton
					ref={btnRef}
					type="light"
					disabled={
						!loan.valid
						|| !collateral.valid
						|| !loan.value
						|| !collateral.value
						|| inputToken.value.toLowerCase() !== collateralTokenAddress.toLowerCase() && !inputToken.amount
					}
					loading={loading || inputToken.loading && inputToken.value !== collateralTokenAddress}
					block
					className="blur-xs"
					onClick={openLoan}
				>
					{(inputToken.value !== collateralTokenAddress && inputToken.loading)
						? "Calculating the amount..."
						: (
							inputToken.value !== collateralTokenAddress && inputToken.amount === null
								? `Send ${inputToken.symbol}`
								: `Send ${collateral.valid ? toLocalString(inputToken.value === collateralTokenAddress ? collateral.value : inputToken.amount.toFixed(inputToken.decimals)) : ""} ${inputToken.symbol}`
						)}
				</MetaMaskButton>
				<div className="px-2 pt-2 text-xs text-center text-white/60">
					GBYTE is Obyte's native token, you can get it <a href="https://getmein.ooo/" target="_blank" className="text-primary" rel="noopener">here</a> and bridge to Kava via <a href="https://counterstake.org" target="_blank" rel="noopener" className="text-primary">Counterstake</a>
				</div>
			</div>
		</>
	);
};
