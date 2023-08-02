import { useEffect, useRef, useState } from "react";
import { formatUnits, parseUnits } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import ReactGA from "react-ga4";

import { Input } from "@/components/atoms";
import { MetaMaskButton } from "@/components/molecules";

import { sendNotification } from "@/store/thunks/sendNotification";
import {
	selectWalletAddress,
	selectWalletBalance,
} from "@/store/slices/settingsSlice";

import contractAPI from "@/services/contractAPI";
import { getCountOfDecimals, recognizeMetamaskError } from "@/utils";

export const StakingForm = ({ symbol, decimals, address, onClose }) => {
	const [amount, setAmount] = useState({ value: "", valid: true });
	const [loading, setLoading] = useState(false);
	const userBalance = useSelector(selectWalletBalance);
	const walletAddress = useSelector(selectWalletAddress);

	const btnRef = useRef();
	const dispatch = useDispatch();

	const handleKeyDown = (ev) => {
		if (ev.code === "Enter" || ev.code === "NumpadEnter") {
			btnRef.current.click();
		}
	};

	const balance = userBalance[address] || "0";
	const max =
		BigInt(balance) > 0n
			? Math.floor(Number(formatUnits(balance, decimals) * 10 ** 9)) / 10 ** 9
			: 0;

	useEffect(() => {
		if (max) {
			handleChange(null, max.toString());
		} else if (address in userBalance) {
			setAmount({ amount: "", valid: true });
		}
	}, [userBalance]);

	const handleChange = (ev, v) => {
		const value = v || ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setAmount({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= (decimals < 9 ? decimals : 9) &&
			Number(value) <= 1e6 &&
			Number(value) >= 0
		) {
			setAmount({ value, valid });
		}
	};

	const stake = async () => {
		try {
			setLoading(true);

			await contractAPI.stake(
				address,
				parseUnits(amount.value, BigInt(String(decimals)))
			);

			ReactGA.event({
				category: "staking",
				action: "stake",
				value: Number(amount.value),
				label: symbol
			});
			
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
			onClose && onClose();
		}
	};

	const maxFill = () => {
		handleChange(null, max.toString());
	};

	return (
		<>
			<Input
				label={
					<span>
						Token amount{" "}
						{!!max && (
							<b onClick={maxFill} className="cursor-pointer">
								(max: {max})
							</b>
						)}
					</span>
				}
				className="mb-3"
				suffix={symbol}
				disabled={loading}
				value={amount.value}
				error={!!amount.value && !amount.valid}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
			/>

			<MetaMaskButton
				ref={btnRef}
				type="light"
				disabled={!amount.valid || !amount.value || !walletAddress}
				loading={loading}
				block
				className="blur-xs"
				onClick={stake}
			>
				Stake
			</MetaMaskButton>
		</>
	);
};
