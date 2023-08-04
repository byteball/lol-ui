import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactGA from "react-ga4";

import { Input } from "@/components/atoms";
import { MetaMaskButton } from "@/components/molecules";
import {
	selectCollateralSymbol,
	selectWalletAddress,
} from "@/store/slices/settingsSlice";
import {
	getCountOfDecimals,
	recognizeMetamaskError,
	toLocalString,
} from "@/utils";
import contractAPI from "@/services/contractAPI";
import { sendNotification } from "@/store/thunks/sendNotification";
import { parseUnits } from "ethers";
import { selectLinePrice } from "@/store/slices/priceSlice";

export const CreateBuyOrderForm = ({ setEstimatedPoint }) => {
	const collateralSymbol = useSelector(selectCollateralSymbol);
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState({ value: "", valid: true });
	const [strikePriceInited, setStrikePriceInited] = useState(false);

	const [strikePrice, setStrikePrice] = useState({ value: "", valid: true });
	const [hedgePrice, setHedgePrice] = useState({ value: "", valid: true });
	const linePrice = useSelector(selectLinePrice);
	const walletAddress = useSelector(selectWalletAddress);

	const dispatch = useDispatch();
	const btnRef = useRef();

	const handleAmountChange = (ev) => {
		const value = ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setAmount({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= 18 &&
			Number(value) <= 1e9 &&
			Number(value) >= 0
		) {
			setAmount({ value, valid });
		}
	};

	const handleStrikePriceChange = (ev) => {
		const value = ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setStrikePrice({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= 18 &&
			value <= 1e9 &&
			Number(value) >= 0
		) {
			setStrikePrice({ value, valid });
			setEstimatedPoint((e) => ({ ...e, strike_price: +value }));
		}
	};

	const handleHedgePriceChange = (ev) => {
		const value = ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setHedgePrice({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= 18 &&
			Number(value) <= 1e9 &&
			Number(value) >= 0
		) {
			setHedgePrice({ value, valid });
			setEstimatedPoint((e) => ({ ...e, hedge_price: +value }));
		}
	};

	const handleKeyDown = (ev) => {
		if (ev.code === "Enter" || ev.code === "NumpadEnter") {
			btnRef.current.click();
		}
	};

	const createBuyOrder = async () => {
		try {
			setLoading(true);

			await contractAPI.createBuyOrder(
				parseUnits(String(amount.value), 18),
				parseUnits(String(strikePrice.value), 18),
				parseUnits(String(hedgePrice.value), 18)
			);

			dispatch(
				sendNotification({
					title: "Transaction successful",
					type: "success",
				})
			);

			ReactGA.event({
				category: "market",
				action: "create_order",
				value: Number(amount.value),
				label: 'buy'
			});
		} catch (error) {
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (linePrice && !strikePriceInited) {
			setStrikePrice({ value: linePrice, valid: true });
			setStrikePriceInited(true);
		}
	}, [linePrice]);

	const estTokenAmount =
		amount.value && amount.valid && hedgePrice.value && hedgePrice.valid
			? amount.value / hedgePrice.value
			: 0;

	return (
		<div>
			<Input
				onChange={handleAmountChange}
				onKeyDown={handleKeyDown}
				value={amount.value}
				placeholder=""
				label="Amount"
				labelDescription="Maximum amount you are prepared to pay for the hedge. Your order might be filled by several loans."
				className="mb-5"
				suffix={collateralSymbol}
			/>

			<Input
				onChange={handleStrikePriceChange}
				onKeyDown={handleKeyDown}
				value={strikePrice.value}
				placeholder=""
				label="Strike price"
				labelDescription="Minimum strike price of the loans you are willing to buy"
				suffix={collateralSymbol}
				className="mb-5"
			/>

			<Input
				onChange={handleHedgePriceChange}
				onKeyDown={handleKeyDown}
				value={hedgePrice.value}
				placeholder=""
				label="Hedge price"
				labelDescription="Maximum price you are prepared to pay per 1 LINE of loan amount"
				suffix={collateralSymbol}
				className="mb-5"
			/>

			{!!estTokenAmount && (
				<div className="mb-5 text-sm font-medium text-white/60">
					Est. max loan amount
					<span className="ml-1 text-gray-300">
						{toLocalString(estTokenAmount)} <small>LINE</small>
					</span>
				</div>
			)}

			<MetaMaskButton
				onClick={createBuyOrder}
				block
				disabled={
					!hedgePrice.value ||
					!hedgePrice.valid ||
					!strikePrice.value ||
					!strikePrice.valid ||
					!amount.value ||
					!amount.valid ||
					!walletAddress
				}
				loading={loading}
				ref={btnRef}
				type="light"
			>
				Create buy order
			</MetaMaskButton>
		</div>
	);
};
