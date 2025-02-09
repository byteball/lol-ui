import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatUnits, parseUnits } from "ethers";
import cn from "classnames";
import ReactGA from "react-ga4";

import { MetaMaskButton, QuestionTooltip } from "@/components/molecules";

import { sendNotification } from "@/store/thunks/sendNotification";

import contractAPI from "@/services/contractAPI";

import {
	getCountOfDecimals,
	recognizeMetamaskError,
	toLocalString,
} from "@/utils";
import { Input } from "@/components/atoms";
import { SelectLoan } from "@/components/organisms";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { useParams } from "react-router-dom";
import { historyInstance } from "@/historyInstance";
import { selectCheckedBySaleLoans } from "@/store/customSelectors/selectCheckedBySaleLoans";

export const CreateSellOrderForm = ({ setEstimatedPoint, estimatedPoint }) => {
	const [price, setPrice] = useState({ value: "", valid: true });
	const [loading, setLoading] = useState(false);
	const loans = useSelector(selectCheckedBySaleLoans);
	const walletAddress = useSelector(selectWalletAddress);
	const [selectedLoanToSell, setSelectedLoanToSell] = useState(null);

	const { id: idInUrl } = useParams();
	const dispatch = useDispatch();
	const btnRef = useRef();

	const handleKeyDown = (ev) => {
		if (ev.code === "Enter" || ev.code === "NumpadEnter") {
			btnRef.current.click();
		}
	};

	useEffect(() => {
		if (idInUrl === undefined) {
			setSelectedLoanToSell(null);
			setPrice({ value: "", valid: true });
			setEstimatedPoint({ strike_price: 0, hedge_price: 0 });
		}
	}, [walletAddress]);

	const handlePriceChange = (ev, v) => {
		const value = v || ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setPrice({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= 18 &&
			Number(value) <= 1e9 &&
			Number(value) >= 0
		) {
			setPrice({ value, valid });
		} else if (value === "") {
			setPrice({ value: "", valid: false });
		}

		if (valid && selectedLoanToSell) {
			const strike_price =
				+formatUnits(selectedLoanToSell.collateral_amount, 18).toString() /
				+formatUnits(selectedLoanToSell.current_loan_amount, 18).toString();

			const hedge_price =
				Number(value) /
				+formatUnits(selectedLoanToSell.current_loan_amount, 18).toString();
			setEstimatedPoint({ strike_price: +strike_price, hedge_price });
		} else if (selectedLoanToSell) {
			const strike_price =
				+formatUnits(selectedLoanToSell.collateral_amount, 18).toString() /
				+formatUnits(selectedLoanToSell.current_loan_amount, 18).toString();

			setEstimatedPoint({ strike_price, hedge_price: 0 });
		} else {
			setEstimatedPoint({ strike_price: 0, hedge_price: 0 });
		}
	};

	const createSellOrder = async () => {
		try {
			setLoading(true);

			await contractAPI.createSellOrder(
				selectedLoanToSell.loan_num,
				parseUnits(price.value)
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
				value: Number(price.value),
				label: 'sell'
			});

			setEstimatedPoint({ strike_price: 0, collateral_price: 0 });
			setSelectedLoanToSell(null);
			setPrice({ value: "", valid: true });
		} catch (error) {
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setPrice({ value: "", valid: false });

		if (selectedLoanToSell) {
			const strike_price =
				+formatUnits(selectedLoanToSell.collateral_amount, 18).toString() /
				+formatUnits(selectedLoanToSell.current_loan_amount, 18).toString();

			setEstimatedPoint({ strike_price, hedge_price: 0 });
		}
	}, [selectedLoanToSell]);

	useEffect(() => {
		if (idInUrl !== undefined) {
			const loan = loans.find(
				({ loan_num }) => String(loan_num) === String(idInUrl)
			);

			if (loan) {
				setSelectedLoanToSell(loan);
				historyInstance.replace("/market");
			}
		}
	}, [idInUrl, loans]);

	return (
		<div>
			<SelectLoan
				walletAddress={walletAddress}
				value={selectedLoanToSell}
				onChange={setSelectedLoanToSell}
				label="Loan to sell"
				className="mb-3"
			>
				{loans.map((value) => (
					<SelectLoan.Option
						disabled={value.sale}
						key={
							value.loan_num ? `s-${value.loan_num}` : `b-${value.buy_order_id}`
						}
						value={value}
					/>
				))}
			</SelectLoan>

			<Input
				label="Price"
				labelDescription="How much you want to be paid for the entire loan"
				className="mb-3"
				value={price.value}
				suffix="LINE"
				onChange={handlePriceChange}
				onKeyDown={handleKeyDown}
			/>

			{estimatedPoint.strike_price ? (
				<div
					className={cn("block text-sm font-medium text-white/60", {
						"mb-1": estimatedPoint.hedge_price,
					})}
				>
					Strike price <QuestionTooltip description={<span>The price of LOL the loan holder can get by repaying it</span>} />{" "}
					<span className="ml-1 text-gray-300">
						{toLocalString(estimatedPoint.strike_price)}{" "}
						<small>LINE</small>
					</span>
				</div>
			) : null}

			{estimatedPoint.hedge_price ? (
				<div className="block text-sm font-medium text-white/60">
					Hedge price <QuestionTooltip description={<span>How much the buyer of the loan would pay for hedging 1 LOL</span>} />{" "}
					<span className="ml-1 text-gray-300">
						{toLocalString(estimatedPoint.hedge_price)}{" "}
						<small>LINE</small>
					</span>
				</div>
			) : null}

			<MetaMaskButton
				ref={btnRef}
				onClick={createSellOrder}
				block
				type="light"
				disabled={!price.valid || !price.value || !selectedLoanToSell}
				loading={loading}
				className={cn({ "mt-3": selectedLoanToSell })}
			>
				Create sell order
			</MetaMaskButton>
		</div>
	);
};
