import { useState } from "react";
import { useDispatch } from "react-redux";

import { MetaMaskButton } from "@/components/molecules";

import { sendNotification } from "@/store/thunks/sendNotification";

import contractAPI from "@/services/contractAPI";

import { recognizeMetamaskError, toBalanceString } from "@/utils";

export const ClaimForm = ({ accumulatedReward, address, onClose }) => {
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const claim = async () => {
		try {
			setLoading(true);

			await contractAPI.claimReward(address);

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
			<div className="text-white/60">
				You will get your reward:{" "}
				<b>
					{toBalanceString(accumulatedReward, 18)} <small>LINE</small>
				</b>
				.
			</div>

			<MetaMaskButton
				block
				loading={loading}
				onClick={claim}
				className="mt-3"
				type="light"
			>
				Claim reward
			</MetaMaskButton>
		</div>
	);
};
