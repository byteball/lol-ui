import { QuestionTooltip } from "@/components/molecules";
import { Button, Redirect, Spin } from "@/components/atoms";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useSelector } from "react-redux";

import { selectUserPoolsWithMeta } from "@/store/customSelectors";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { selectUserPoolsLoading } from "@/store/slices/poolsSlice";
import { PoolManageDrawer } from "..";

import { toLocalString, toBalanceString } from "@/utils";

import appConfig from "@/appConfig";

export const MyStakingPoolList = () => {
	const userPools = useSelector(selectUserPoolsWithMeta);

	const walletAddress = useSelector(selectWalletAddress);
	const loading = useSelector(selectUserPoolsLoading);

	if (!walletAddress) return <Redirect path="/staking/all" />;

	if (loading) return <Spin />;

	if (!userPools.length) {
		return (
			<div className="text-center text-gray-600">
				You haven't staked any tokens yet
			</div>
		);
	}

	return (
		<div>
			<ul role="list" className="space-y-4">
				{userPools.map(({ symbol, address, stake, apy, reward, decimals }) => (
					<MyStakingPoolItem
						key={address}
						address={address}
						symbol={symbol}
						stakingBalance={stake}
						apy={apy}
						decimals={decimals}
						accumulatedReward={reward}
					/>
				))}
			</ul>
		</div>
	);
};

const MyStakingPoolItem = ({
	address,
	symbol,
	apy = 0,
	stakingBalance = "0",
	decimals = 18,
	accumulatedReward = "0",
}) => {
	const [open, setOpen] = useState(false);

	const apyView =
		apy && (apy > 1e6 ? "> 1m." : `${toLocalString(+apy.toPrecision(4))}%`);
	const stakingBalanceView =
		stakingBalance !== undefined
			? toBalanceString(stakingBalance, decimals)
			: 0;
	const accumulatedRewardView =
		accumulatedReward !== undefined
			? toBalanceString(accumulatedReward, decimals)
			: 0;

	return (
		<li className="flex flex-wrap items-center w-full px-4 py-3 space-y-2 overflow-hidden border rounded-md shadow lg:space-y-0 lg:gap-4 lg:flex-nowrap bg-primary/10 border-primary/20">
			<div className="basis-[100%] leading-tight w-full lg:basis-[30%] lg:w-[30%]">
				<div className="flex items-center mb-1 space-x-1 text-sm leading-none text-white/60">
					<div>Pool</div>
				</div>
				<a
					href={`https://equilibrefinance.com/pools/manage/${address}`}
					target="_blank"
					className="flex items-center mt-3 space-x-2 text-lg font-bold leading-none"
				>
					<p className="overflow-hidden truncate">{symbol}</p>{" "}
					<ArrowTopRightOnSquareIcon className="inline shrink-0 w-[1em] h-[1em]" />
				</a>
			</div>

			<div className="basis-1/2 leading-tight lg:basis-[15%]">
				<div className="flex items-center mb-1 space-x-1 text-sm leading-none text-white/60">
					<div>APY</div>{" "}
					<QuestionTooltip description="Rewards APY, not including income from trading fees." />
				</div>
				<div className="mt-3 text-lg font-bold leading-none">
					{apy !== undefined ? (
						apyView
					) : (
						<div className="h-[1em] w-[6em] rounded-md bg-white/20 animate-pulse" />
					)}
				</div>
			</div>

			<div className="basis-1/2 leading-tight lg:basis-[20%]">
				<div className="flex items-center mb-1 space-x-1 text-sm leading-none text-white/60">
					<div>Staked balance</div>
				</div>
				<div className="mt-3 text-lg font-bold leading-none">
					{stakingBalance ? (
						stakingBalanceView
					) : (
						<div className="h-[1.75rem] w-[6em] rounded-md bg-white/20 animate-pulse" />
					)}
				</div>
			</div>

			<div className="basis-1/2 leading-tight lg:basis-[20%]">
				<div className="flex items-center mb-1 space-x-1 text-sm leading-none text-white/60">
					<div>Accumulated reward</div>
				</div>
				<div className="mt-3 text-lg font-bold leading-none">
					{accumulatedReward ? (
						accumulatedRewardView
					) : (
						<div className="h-[1.75rem] w-[6em] rounded-md bg-white/20 animate-pulse" />
					)}
				</div>
			</div>

			<div className="basis-[100%] w-[100%] lg:basis-[20%] lg:w-[20%]">
				<Button block type="light" onClick={() => setOpen(true)}>
					Manage
				</Button>
				<PoolManageDrawer
					open={open}
					setOpen={setOpen}
					symbol={symbol}
					decimals={decimals}
					address={address}
					stakingBalance={stakingBalance}
					accumulatedReward={accumulatedReward}
				/>
			</div>
		</li>
	);
};
