import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { G2, Scatter } from "@ant-design/plots";
import { formatUnits } from "ethers";
import { useSelector } from "react-redux";
import {
	selectCollateralSymbol,
	selectSymbol,
	selectWalletAddress,
} from "@/store/slices/settingsSlice";
import { selectLinePrice } from "@/store/slices/priceSlice";
import { toLocalString } from "@/utils";
import { meanBy } from "lodash";
import { deepMix } from "@antv/util";

export const BUY_ORDER = "buy order";
export const SELL_ORDER = "sell order";

export const MY_BUY_ORDER = "my buy order";
export const MY_SELL_ORDER = "my sell order";

const transformTooltipNames = (name) => {
	if (name === "strike_price") {
		return "Strike price";
	} else if (name === "hedge_price") {
		return "Hedge price";
	} else if (name === "type") {
		return "Type";
	} else {
		return name;
	}
};

export default memo(({ setSelectedOrder, estimatedPoint, orders }) => {
	const [data, setData] = useState([]);
	const chartRef = useRef();
	const collateralSymbol = useSelector(selectCollateralSymbol);
	const tokenSymbol = useSelector(selectSymbol);
	const walletAddress = useSelector(selectWalletAddress);
	const linePrice = useSelector(selectLinePrice);

	const min = useMemo(() => Math.min(...(data || [{ strike_price: 0 }]).map(d => d.strike_price)), [data]);
	const max = useMemo(() => Math.max(...(data || [{ strike_price: 0 }]).map(d => d.strike_price)), [data]);

	const config = {
		appendPadding: [30, 5, 5, 5],
		animation: false,
		xField: "strike_price",
		yField: "hedge_price",
		shape: "circle",
		colorField: "type",
		legend: {
			type: "category",
		},
		color: ({ type }) => {
			if (type === BUY_ORDER) {
				return "#27ae60";
			} else if (type === SELL_ORDER) {
				return "#ff433e";
			} else if (type === MY_SELL_ORDER) {
				return "#591815";
			} else if (type === MY_BUY_ORDER) {
				return "#145931";
			}
		},
		size: 7,
		interactions: [{ type: "element-single-selected", enable: true }],
		xAxis: {
			title: {
				text: `Strike price (${collateralSymbol})`,
			},
			min: min - ((max - min) * 0.1),
			max: max + ((max - min) * 0.1)
		},
		yAxis: {
			title: {
				text: `Hedge price (${collateralSymbol})`,
			},
			label: {
				formatter: (v) => `${+Number(v).toFixed(6)}`,
			},
		},
		tooltip: {
			customContent: (_, data) => {
				return `<div class="pt-2 pb-2">
          ${data[0]?.data &&
					`<div class="mb-2 last:mb-0">
            ${data[0].data.buy_order_id ? "Amount" : "Loan amount"
					}: ${toLocalString(data[0].data.buy_order_id ? data[0]?.data.amount : data[0]?.data.current_loan_amount)} ${data[0].data.buy_order_id ? collateralSymbol : tokenSymbol}
          </div>`
					}

        ${data
						.map(
							({ name, value }) => `
          <div class="mb-2 last:mb-0">
            ${transformTooltipNames(name)}: ${name !== "type" ? toLocalString(value) : value
						} ${name !== "type" ? collateralSymbol : ""}
          </div>
        `
						)
						.join(" ")}
        </div>`;
			},
		},
	};

	useEffect(() => {
		const mapItems = orders.map((order) => {
			if (order.type === SELL_ORDER) {
				return {
					loan_num: order.loan_num,
					strike_price: +formatUnits(BigInt(order.strike_price), 18),
					hedge_price:
						formatUnits(BigInt(order.price), 18) /
						formatUnits(BigInt(order.current_loan_amount), 18),
					type:
						order.user.toLowerCase() === (walletAddress || "").toLowerCase()
							? MY_SELL_ORDER
							: order.type,
					price: formatUnits(BigInt(order.price), 18),
					collateral_amount: +formatUnits(BigInt(order.collateral_amount), 18),
					current_loan_amount: +Number(
						formatUnits(BigInt(order.current_loan_amount), 18)
					).toFixed(9),
				};
			} else if (order.type === BUY_ORDER) {
				return {
					strike_price: +formatUnits(BigInt(order.strike_price), 18),
					hedge_price: +formatUnits(BigInt(order.hedge_price), 18),
					hedge_price_big: order.hedge_price,
					buy_order_id: order.buy_order_id,
					type:
						order.user.toLowerCase() === (walletAddress || "").toLowerCase()
							? MY_BUY_ORDER
							: order.type,
					current_hedge_price: +formatUnits(
						BigInt(order.current_hedge_price),
						18
					),
					amount: +formatUnits(BigInt(order.amount), 18),
				};
			}
		});

		const avgHedgePrice = meanBy(mapItems, "hedge_price", [mapItems]);
		const avgStrikePrice = meanBy(mapItems, "strike_price", [mapItems]);

		setData(
			mapItems.filter(({ hedge_price, strike_price }) => {
				return (
					hedge_price < avgHedgePrice * 2 && strike_price < avgStrikePrice * 2
				);
			})
		);
	}, [orders, walletAddress]);

	useEffect(() => {
		chartRef.current.on("point:statechange", ({ gEvent }) => {
			if (gEvent.originalEvent?.state === "selected") {
				if (gEvent.originalEvent?.stateStatus) {
					const type = gEvent.originalEvent?.element?.data.type;

					if (
						type === BUY_ORDER ||
						type === SELL_ORDER ||
						type === MY_BUY_ORDER ||
						type === MY_SELL_ORDER
					) {
						setSelectedOrder(gEvent.originalEvent?.element?.data);
					}
				} else {
					setSelectedOrder(null);
				}
			}
		});
	}, [chartRef.current]);

	useEffect(() => {
		const annotationsLine = [
			{
				type: "line",
				start: [linePrice, "min"],
				end: [linePrice, "9999"],
				style: {
					stroke: "#ccc",
					lineWidth: 1,
				},
			},
			{
				type: "line",
				start: [linePrice, "min"],
				end: [linePrice, "max"],
				style: {
					stroke: "#ccc",
					lineWidth: 1,
				},
				text: {
					content: "Current price",
					position: "bottom",
					offsetY: 90,
					offsetX: -10,
					style: {
						fill: "#ccc",
						fontSize: 14,
					},
					background: {
						padding: 4,
						style: {
							radius: 4,
							fill: "rgba(256, 256, 256, 0.2)",
						},
					},
				},
			},
			{
				type: "text",
				position: [linePrice, "max"],
				offsetX: 10,
				offsetY: -20,
				content: "in the money \n ----------->", //→
				textAllowOverlap: true,
				style: {
					textAlign: "left",
					fontWeight: "500",
					fill: "white",
					fontSize: 14,
					opacity: 0.3,
				},
			},
			{
				type: "text",
				position: [linePrice, "max"],
				content: "out of the money \n <-----------", //←
				offsetX: -10,
				offsetY: -20,
				style: {
					textAlign: "right",
					fontWeight: "500",
					fill: "white",
					fontSize: 14,
					opacity: 0.3,
				},
			},
		];

		if (Number(estimatedPoint.hedge_price) !== 0) {
			annotationsLine.push({
				// horizontal
				type: "line",
				start: ["min", estimatedPoint.hedge_price],
				end: ["max", estimatedPoint.hedge_price],
				style: {
					stroke: "#0281EB",
					lineDash: [2, 2],
				},
			});
		}

		if (Number(estimatedPoint.strike_price) !== 0) {
			annotationsLine.push({
				// vertical
				type: "line",
				start: [estimatedPoint.strike_price, "min"],
				end: [estimatedPoint.strike_price, "max"],
				style: {
					stroke: "#0281EB",
					lineDash: [2, 2],
				},
			});
		}

		chartRef.current.update({
			annotations: annotationsLine,
		});

		chartRef.current.chart.removeInteraction("legend-filter");
	}, [
		chartRef.current,
		estimatedPoint.strike_price,
		estimatedPoint.hedge_price,
		linePrice,
	]);

	return (
		<Scatter
			renderer="canvas"
			autoFit={true}
			theme={deepMix({}, G2.getTheme("dark"), {
				background: "#030712",
			})}
			data={data}
			chartRef={chartRef}
			{...config}
		/>
	);
});
