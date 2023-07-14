import {
	calcStrikePrice,
	recognizeMetamaskError,
	toLocalString,
} from "@/utils";
import { formatUnits, parseUnits } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { MetaMaskButton, QuestionTooltip } from "@/components/molecules";
import contractAPI from "@/services/contractAPI";
import { sendNotification } from "@/store/thunks/sendNotification";

import {
	BUY_ORDER,
	MY_BUY_ORDER,
	MY_SELL_ORDER,
	SELL_ORDER,
} from "../OrdersScatterChart/OrdersScatterChart";
import {
	selectCollateralSymbol,
	selectSymbol,
	selectWalletAddress,
} from "@/store/slices/settingsSlice";
import { SelectLoanToSell } from "..";
import { selectLoans } from "@/store/slices/loansSlice";

const big1e18 = 1000000000000000000n;

const filterLoans = (a, b) => {
	return +(
		(BigInt(b.loan_amount) - BigInt(a.loan_amount)) /
		big1e18
	).toString();
};

export const SelectedOrder = ({
	selectedOrder,
	setEstimatedPoint,
	setSelectedOrder,
}) => {
	const [loading, setLoading] = useState(false);
	const [selectedLoanForSell, setSelectedLoanForSell] = useState(null);

	const collateralSymbol = useSelector(selectCollateralSymbol);
	const tokenSymbol = useSelector(selectSymbol);
	const walletAddress = useSelector(selectWalletAddress);

	const loans = useSelector(selectLoans);
	const sortedLoans = useMemo(() => [...loans].sort(filterLoans), [loans]);

	const sortedLoansWithData = useMemo(() => {
		if (selectedOrder) {
			return sortedLoans.map((data) => ({
				...data,
				price: Number(
					selectedOrder.hedge_price *
						Number(formatUnits(BigInt(data.current_loan_amount)).toString())
				),
				loanStrikePrice: Number(
					+formatUnits(
						BigInt(
							calcStrikePrice(data.collateral_amount, data.current_loan_amount)
						),
						18
					)
				),
			}));
		} else {
			return [];
		}
	}, [sortedLoans, selectedOrder]);

	const dispatch = useDispatch();

	useEffect(() => {
		setSelectedLoanForSell(null);
	}, [selectedOrder, walletAddress]);

	if (
		!selectedOrder ||
		(!selectedOrder.loan_num && !selectedOrder.buy_order_id)
	)
		return <div className="text-primary/60">No selected order</div>;

	const { type } = selectedOrder;

	const walletOrder = type === MY_BUY_ORDER || type === MY_SELL_ORDER;

	const isSellOrder = type === SELL_ORDER || type === MY_SELL_ORDER;

	const buyOrSell = async () => {
		try {
			setLoading(true);

			if (isSellOrder) {
				await contractAPI.buyLoan(
					selectedOrder.loan_num,
					parseUnits(selectedOrder.price, 18).toString()
				);
			} else if (type === BUY_ORDER) {
				const min_price =
					(BigInt(selectedOrder.hedge_price_big) *
						BigInt(selectedLoanForSell.current_loan_amount)) /
					BigInt(10 ** 18);

				await contractAPI.sellLoan(
					selectedLoanForSell.loan_num,
					selectedOrder.buy_order_id,
					min_price - 1n
				);
			}

			dispatch(
				sendNotification({
					title: "Transaction successful",
					type: "success",
				})
			);

			setEstimatedPoint({ strike_price: 0, collateral_price: 0 });
			setSelectedOrder({});
			setSelectedLoanForSell(null);
		} catch (error) {
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setLoading(false);
		}
	};

	const cancel = async () => {
		try {
			setLoading(true);

			await contractAPI.cancelOrder(
				type === MY_BUY_ORDER ? "buy" : "sell",
				type === MY_BUY_ORDER
					? selectedOrder.buy_order_id
					: selectedOrder.loan_num
			);

			dispatch(
				sendNotification({
					title: "Transaction successful",
					type: "success",
				})
			);
		} catch (error) {
			const notificationPayload = recognizeMetamaskError(error);
			dispatch(sendNotification(notificationPayload));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			{!isSellOrder && (
				<div className="mb-1 text-sm font-medium text-white/60">
					Amount{" "}
					<QuestionTooltip description="Maximum amount the buyer is willing to pay for loans" />
					<span className="ml-1 text-gray-300">
						{toLocalString(selectedOrder.amount.toFixed(9))}{" "}
						<small>{collateralSymbol}</small>
					</span>
				</div>
			)}

			{isSellOrder && (
				<div className="mb-1 text-sm font-medium text-white/60">
					Loan amount{" "}
					<QuestionTooltip description="Current loan amount, including the accrued interest" />
					<span className="ml-1 text-gray-300">
						{toLocalString(selectedOrder.current_loan_amount.toFixed(9))}{" "}
						<small>{tokenSymbol}</small>
					</span>
				</div>
			)}

			{isSellOrder && (
				<div className="mb-1 text-sm font-medium text-white/60">
					Collateral amount{" "}
					<QuestionTooltip description="Collateral backing the loan. It’s what you get if you repay the loan." />
					<span className="ml-1 text-gray-300">
						{toLocalString(selectedOrder.collateral_amount.toFixed(9))}{" "}
						<small>{collateralSymbol}</small>
					</span>
				</div>
			)}

			<div className="mb-1 text-sm font-medium text-white/60">
				Strike price{" "}
				<QuestionTooltip
					description={
						isSellOrder
							? "Current strike price of the loan — how many GBYTE you would get per 1 LINE of the loan amount. The strike price gradually goes down as interest accrues."
							: "Minimum strike price of the loans the buyer is willing to buy"
					}
				/>
				<span className="ml-1 text-gray-300">
					{toLocalString(+selectedOrder.strike_price.toFixed(9))}{" "}
					<small>{collateralSymbol}</small>
				</span>
			</div>

			{isSellOrder && (
				<div className="mb-1 text-sm font-medium text-white/60">
					Loan price{" "}
					<QuestionTooltip description="How much the seller asks for the loan." />
					<span className="ml-1 text-gray-300">
						{toLocalString(Number(selectedOrder.price).toFixed(9))}{" "}
						<small>{collateralSymbol}</small>
					</span>
				</div>
			)}

			<div className="mb-1 text-sm font-medium text-white/60">
				Hedge price{" "}
				<QuestionTooltip
					description={
						isSellOrder
							? "How much you would pay per unit of hedge (1 LINE of loan amount) if you buy this loan."
							: "Maximum price the buyer is prepared to pay per 1 LINE of loan amount"
					}
				/>
				<span className="ml-1 text-gray-300">
					{toLocalString(+selectedOrder.hedge_price.toFixed(9))}{" "}
					<small>{collateralSymbol}</small>
				</span>
			</div>

			{!isSellOrder && !walletOrder && (
				<SelectLoanToSell
					className="mb-1"
					selectedOrder={selectedOrder}
					value={selectedLoanForSell}
					onChange={setSelectedLoanForSell}
					walletAddress={walletAddress}
				>
					{sortedLoansWithData.map((value) => (
						<SelectLoanToSell.Option
							key={
								value.loan_num
									? `s-${value.loan_num}`
									: `b-${value.buy_order_id}`
							}
							value={value}
						/>
					))}
				</SelectLoanToSell>
			)}

			{walletOrder ? (
				<>
					<MetaMaskButton
						type="light"
						className="mt-2"
						loading={loading}
						onClick={cancel}
						block
					>
						Cancel
					</MetaMaskButton>
				</>
			) : (
				<MetaMaskButton
					loading={loading}
					onClick={buyOrSell}
					type="light"
					className="mt-2"
					block
					disabled={
						(!isSellOrder && selectedLoanForSell === null) || !walletAddress
					}
				>
					{isSellOrder ? "Buy" : "Sell"}
				</MetaMaskButton>
			)}
		</div>
	);
};
