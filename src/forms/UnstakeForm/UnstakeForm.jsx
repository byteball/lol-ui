import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { formatEther, parseUnits } from "ethers";
import ReactGA from "react-ga4";

import { MetaMaskButton } from "@/components/molecules";
import { Checkbox, Input } from "@/components/atoms";

import { sendNotification } from "@/store/thunks/sendNotification";

import contractAPI from "@/services/contractAPI";

import {
	getCountOfDecimals,
	recognizeMetamaskError,
	toBalanceString,
} from "@/utils";

export const UnstakeForm = ({
	symbol,
	address,
	stakingBalance,
	decimals,
	accumulatedReward,
	onClose,
}) => {
	const btnRef = useRef();

	const [loading, setLoading] = useState(false);
	const [claimReward, setClaimReward] = useState(true);
	const [unstakeAll, setUnstakeAll] = useState(false);
	const [amount, setAmount] = useState({ value: "", valid: true });

	const dispatch = useDispatch();

	useEffect(() => {
		if (BigInt(stakingBalance) > 0n) {
			setAmount({
				value: formatEther(stakingBalance, decimals).toString(),
				valid: true,
			});
		}
	}, [stakingBalance]);

	const handleKeyDown = (ev) => {
		if (ev.code === "Enter" || ev.code === "NumpadEnter") {
			btnRef.current.click();
		}
	};

	const handleChange = (ev) => {
		const value = ev.target.value.trim();
		const valid = !isNaN(Number(value)) && Number(value) > 0;

		if (value === "." || value === ",") {
			setAmount({ value: "0.", valid: false });
		} else if (
			getCountOfDecimals(value) <= decimals &&
			Number(value) <= 1e6 &&
			Number(value) >= 0
		) {
			setAmount({ value, valid });
		}
	};

	const unstake = async () => {
		try {
			setLoading(true);

			await contractAPI.unstake(
				address,
				parseUnits(amount.value, decimals),
				claimReward
			);

			ReactGA.event({
				category: "staking",
				action: "unstake",
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

	return (
		<div>
			<div>
				<Input
					label="Unstake amount"
					className="mb-3"
					suffix={symbol}
					disabled={loading}
					value={amount.value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
			</div>

			<div>
				<Checkbox
					className="mb-3"
					checked={claimReward}
					onChange={(e) => setClaimReward(e.target.checked)}
					label="Also claim"
				/>
			</div>

			<div className="text-white/60">
				You will get back{" "}
				<b className="text-gray-300">
					{unstakeAll
						? toBalanceString(stakingBalance, decimals)
						: amount.valid && Number(amount.value)
							? toBalanceString(parseUnits(amount.value, decimals).toString())
							: 0}{" "}
					<small>{symbol}</small>
				</b>
				{claimReward && (
					<>
						{" "}
						and your claimed reward{" "}
						<b className="text-gray-300">
							{toBalanceString(accumulatedReward, 18)} <small>LINE</small>
						</b>
					</>
				)}
				.
			</div>

			<MetaMaskButton
				ref={btnRef}
				block
				loading={loading}
				disabled={!Number(amount.value) || !amount.valid}
				onClick={unstake}
				className="mt-3"
				type="light"
			>
				Unstake
			</MetaMaskButton>
		</div>
	);
};
