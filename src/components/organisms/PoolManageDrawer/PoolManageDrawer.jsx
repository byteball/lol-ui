import { useState } from "react";

import { Drawer, Tabs } from "@/components/molecules";
import { ClaimForm, StakingForm, UnstakeForm } from "@/forms";

export const PoolManageDrawer = ({
	open,
	setOpen,
	symbol,
	decimals,
	address,
	accumulatedReward,
	stakingBalance,
	stakingDisabled = false
}) => {
	const [tab, setTab] = useState(stakingDisabled ? "claim" : "stake");

	const onClose = () => setOpen(false);

	return (
		<Drawer open={open} setOpen={setOpen} title={`Stake ${symbol}`}>
			<Tabs value={tab} onChange={(tab) => setTab(tab)}>
				{!stakingDisabled ? <Tabs.Item value="stake">Stake more</Tabs.Item> : null}
				<Tabs.Item value="claim">Claim reward</Tabs.Item>
				<Tabs.Item value="unstake">Unstake</Tabs.Item>
			</Tabs>

			{(tab === "stake" && !stakingDisabled) ? (
				<StakingForm
					symbol={symbol}
					decimals={decimals}
					address={address}
					onClose={onClose}
				/>
			) : null}

			{tab === "unstake" && (
				<UnstakeForm
					symbol={symbol}
					decimals={decimals}
					address={address}
					stakingBalance={stakingBalance}
					accumulatedReward={accumulatedReward}
					onClose={onClose}
				/>
			)}

			{tab === "claim" && (
				<ClaimForm
					symbol={symbol}
					decimals={decimals}
					address={address}
					accumulatedReward={accumulatedReward}
					onClose={onClose}
				/>
			)}
		</Drawer>
	);
};
