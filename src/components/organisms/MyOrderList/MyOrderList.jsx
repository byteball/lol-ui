import { getAccount, recognizeMetamaskError, toLocalString } from "@/utils";
import { formatUnits } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import cn from "classnames";

import { BUY_ORDER } from "../OrdersScatterChart/OrdersScatterChart";
import contractAPI from "@/services/contractAPI";
import { sendNotification } from "@/store/thunks/sendNotification";
import { selectMarketInited } from "@/store/slices/marketSlice";
import { selectMyMarketOrders } from "@/store/customSelectors/selectMyMarketOrders";
import { Spin } from "@/components/atoms";
import { MetaMaskButton } from "@/components/molecules";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { saveAddressAndLoadLoans } from "@/store/thunks/saveAddressAndLoadLoans";

export const MyOrderList = () => {
	const myOrders = useSelector(selectMyMarketOrders);
	const [idsInProcess, setIdsInProcess] = useState([]);
	const inited = useSelector(selectMarketInited);
	const walletAddress = useSelector(selectWalletAddress);

	const dispatch = useDispatch();

	const cancel = async (type, id) => {
		try {
			setIdsInProcess((ids) => [...ids, `${type}-${id}`]);

			await contractAPI.cancelOrder(type === BUY_ORDER ? "buy" : "sell", id);

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
			setIdsInProcess((ids) =>
				ids.filter((idInList) => idInList !== `${type}-${id}`)
			);
		}
	};

	if (!inited) return <Spin />;

	const logIn = async () => {
		const accountAddress = await getAccount();

		if (accountAddress) {
			dispatch(saveAddressAndLoadLoans(accountAddress));
		}
	};

	if (!walletAddress)
		return (
			<div className="text-primary/60">
				Please{" "}
				<span onClick={logIn} className="font-bold underline cursor-pointer">
					login
				</span>{" "}
				to see your orders
			</div>
		);

	if (!myOrders.length)
		return (
			<div className="text-primary/60">You have not created any orders yet</div>
		);

	return (
		<div>
			<div className="hidden pl-4 pr-4 mb-2 space-x-2 text-sm text-white sm:flex">
				<div className="basis-1/3">Amount</div>
				<div className="basis-1/3">Strike price</div>
				<div className="basis-1/3">Order type</div>
			</div>

			{myOrders.map(
				({
					buy_order_id,
					loan_num,
					type,
					amount,
					current_loan_amount,
					strike_price,
				}) => (
					<div
						key={buy_order_id ? `b-${buy_order_id}` : `l-${loan_num}`}
						className="flex flex-wrap p-3 mb-4 text-sm rounded-lg sm:mb-2 sm:pt-1 sm:pb-1 sm:pl-4 sm:pr-4 sm:flex-nowrap sm:space-x-2 bg-primary/10 text-white/80"
					>
						<div className="basis-1/2 sm:basis-1/3">
							<div className="block text-white sm:hidden">Amount</div>
							{toLocalString(formatUnits(current_loan_amount || amount, 18))}{" "}
							<small>{buy_order_id ? "LINE" : "LOL"}</small>
						</div>

						<div className="basis-1/2 sm:basis-1/3">
							<div className="block text-white sm:hidden">Strike price</div>
							{toLocalString(formatUnits(strike_price, 18))}{" "}
							<small>LINE</small>
						</div>

						<div className="hidden sm:flex sm:justify-between basis-full sm:basis-1/3">
							<div>{type}</div>{" "}
							<div
								onClick={() => cancel(type, buy_order_id || loan_num)}
								className={cn("font-medium cursor-pointer text-primary/50", {
									"pointer-events-none cursor-not-allowed text-gray-500/50":
										idsInProcess.includes(buy_order_id || loan_num),
								})}
							>
								cancel
							</div>
						</div>

						<MetaMaskButton
							type="light"
							className="mt-3 sm:hidden"
							loading={idsInProcess.includes(
								`${type}-${buy_order_id || loan_num}`
							)}
							onClick={() => cancel(type, buy_order_id || loan_num)}
							block
						>
							Cancel {type}
						</MetaMaskButton>
					</div>
				)
			)}
		</div>
	);
};
