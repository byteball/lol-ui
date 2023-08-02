import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cn from "classnames";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Spin } from "@/components/atoms";
import { Tabs } from "@/components/molecules";
import { MyOrderList } from "@/components/organisms";

const OrdersScatterChart = lazy(() =>
	import("@/components/organisms/OrdersScatterChart/OrdersScatterChart")
);

import { loadMarketOrders } from "@/store/thunks/loadMarketOrders";
import { selectMarketInited } from "@/store/slices/marketSlice";
import { selectMarketOrders } from "@/store/customSelectors/selectMarketOrders";
import { SelectedOrder } from "@/components/organisms/SelectedOrder/SelectedOrder";
import { CreateBuyOrderForm } from "@/forms/CreateBuyOrderForm/CreateBuyOrderForm";
import {
	BUY_ORDER,
	MY_BUY_ORDER,
	MY_SELL_ORDER,
	SELL_ORDER,
} from "@/components/organisms/OrdersScatterChart/OrdersScatterChart";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { CreateSellOrderForm } from "@/forms";
import appConfig from "@/appConfig";

export const MarketPage = () => {
	const [selectedOrder, setSelectedOrder] = useState({});
	const [createOrderType, setCreateOrderType] = useState("buy");
	const [estimatedPoint, setEstimatedPoint] = useState({
		strike_price: 0,
		hedge_price: 0,
	});

	const inited = useSelector(selectMarketInited);
	const orders = useSelector(selectMarketOrders);
	const walletAddress = useSelector(selectWalletAddress);

	const { type } = useParams();
	const dispatch = useDispatch();

	useEffect(() => {
		if (!inited) {
			dispatch(loadMarketOrders());
		}
	}, [inited]);

	useEffect(() => {
		if (
			selectedOrder.buy_order_id &&
			(selectedOrder.type === BUY_ORDER || selectedOrder.type === MY_BUY_ORDER)
		) {
			if (
				!orders.find(
					({ buy_order_id }) =>
						String(buy_order_id) === String(selectedOrder.buy_order_id)
				)
			) {
				setSelectedOrder({});
			}
		} else if (
			selectedOrder.loan_num &&
			(selectedOrder.type === SELL_ORDER ||
				selectedOrder.type === MY_SELL_ORDER)
		) {
			if (
				!orders.find(
					({ loan_num }) => String(loan_num) === String(selectedOrder.loan_num)
				)
			) {
				setSelectedOrder({});
			}
		}
	}, [orders]);

	useEffect(() => {
		setSelectedOrder({});
	}, [walletAddress]);

	useEffect(() => {
		if (type === "sell") {
			setCreateOrderType("sell");
		}
	}, [type]);

	const commonStyles =
		"bg-gray-950 p-4 md:p-6 rounded-3xl border-primary/30 border-2 mb-5";

	return (
		<div className="flex flex-col flex-grow-0 flex-shrink-0 w-full p-4 mx-auto mt-8 text-white lg:flex-row md:p-6 max-w-7xl">
			<Helmet>
				<title>{appConfig.titles.market}</title>
			</Helmet>
			<div className={cn("w-full lg:w-auto lg:basis-2/3 lg:mr-5")}>
				<div className={cn(commonStyles)}>
					<h2 className="mb-2 text-2xl font-bold text-white/80">Order map</h2>
					<div className="mb-5 text-md text-white/60">
						<p>
							Here you can buy and sell loans. Loans are put options — holding a
							loan gives you the right (but not an obligation) to sell a certain
							amount of LINE tokens for a certain price (strike price).
						</p>
						<p>
							You can use them as a hedge if you hold LINE tokens. The hedge
							protects you against the drop in price — if it drops below the
							strike price, you can sell your LINE tokens at the strike price by
							repaying the loan.
						</p>
					</div>

					{inited ? (
						<Suspense fallback={<Spin />}>
							{orders.length ? (
								<OrdersScatterChart
									orders={orders}
									setSelectedOrder={setSelectedOrder}
									estimatedPoint={estimatedPoint}
								/>
							) : (
								<div className="text-primary/60">No active orders</div>
							)}
						</Suspense>
					) : (
						<Spin className="mt-5" />
					)}
				</div>

				<div className={cn(commonStyles)}>
					<h2 className="mb-3 text-2xl font-bold text-white/80">My orders</h2>

					<MyOrderList />
				</div>
			</div>

			<div className={cn("w-full lg:w-auto lg:basis-1/3")}>
				<div className={cn(commonStyles)}>
					<h2 className="mb-3 text-2xl font-bold text-white/80">
						Selected {selectedOrder?.type ? selectedOrder.type : "order"}
					</h2>
					<SelectedOrder
						selectedOrder={selectedOrder}
						setSelectedOrder={setSelectedOrder}
						setEstimatedPoint={setEstimatedPoint}
					/>
				</div>

				<div className={cn(commonStyles)}>
					<h2 className="mb-3 text-2xl font-bold text-white/80">
						Create Order
					</h2>

					<Tabs
						value={createOrderType}
						onChange={(v) => {
							setCreateOrderType(v);
							setEstimatedPoint({ strike_price: 0, hedge_price: 0 });
						}}
					>
						<Tabs.Item value="buy">Buy a loan</Tabs.Item>
						<Tabs.Item value="sell">Sell a loan</Tabs.Item>
					</Tabs>

					{createOrderType === "sell" && (
						<CreateSellOrderForm
							setEstimatedPoint={setEstimatedPoint}
							estimatedPoint={estimatedPoint}
						/>
					)}
					{createOrderType === "buy" && (
						<CreateBuyOrderForm setEstimatedPoint={setEstimatedPoint} />
					)}
				</div>
			</div>
		</div>
	);
};
