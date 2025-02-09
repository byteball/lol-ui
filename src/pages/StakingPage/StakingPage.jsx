import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { PageLayout } from "@/components/templates";
import { StakingPoolList, MyStakingPoolList } from "@/components/organisms";
import { Tabs } from "@/components/molecules";
import { Spin } from "@/components/atoms";

import { selectPoolsLoading } from "@/store/slices/poolsSlice";
import { selectWalletAddress } from "@/store/slices/settingsSlice";

import { historyInstance } from "@/historyInstance";

import appConfig from "@/appConfig";

export const StakingPage = () => {
	const poolsLoading = useSelector(selectPoolsLoading);
	const walletAddress = useSelector(selectWalletAddress);
	const [type, setType] = useState(
		location.pathname.includes("my") ? "my" : "all"
	);

	const handleChangeTab = (v) => {
		if (type !== v) {
			setType(v);
			historyInstance.push(`/staking/${v}`);
		}
	};

	useEffect(() => {
		if (location.pathname.includes("my") || location.pathname.includes("all")) {
			const urlType = location.pathname.includes("my") ? "my" : "all";

			if (urlType !== type) {
				setType(urlType);
			}
		} else {
			historyInstance.replace(`/staking/all`);
		}
	}, [location.pathname]);

	return (
		<PageLayout
			title="Staking"
			description="Fees charged from borrowers are used to incentivize holding LOL and providing liquidity in some pools where LOL is traded. Stake LOL, or provide liquidity in such pools and stake your LP tokens here, and get rewards."
		>
			<Helmet>
				<title>{appConfig.titles.staking}</title>
			</Helmet>
			{poolsLoading ? (
				<Spin />
			) : (
				<>
					<Tabs value={type} onChange={handleChangeTab}>
						<Tabs.Item value="all">All</Tabs.Item>
						{!!walletAddress && <Tabs.Item value="my">My pools</Tabs.Item>}
					</Tabs>

					<Routes>
						<Route path="all" element={<StakingPoolList />} />
						<Route path="my" element={<MyStakingPoolList />} />
					</Routes>
				</>
			)}
		</PageLayout>
	);
};
