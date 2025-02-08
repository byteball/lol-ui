import { useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { Tabs } from "@/components/molecules";
import { Spin } from "@/components/atoms";
import { OpenLoanForm } from "@/forms";
import { LoanList } from "@/components/organisms";

import { selectWasFirstInited } from "@/store/slices/settingsSlice";
import { selectParams } from "@/store/slices/paramsSlice";
import { selectLinePrice } from "@/store/slices/priceSlice";
import { EquilibreSwapForm } from "@/forms/EquilibreSwapForm/EquilibreSwapForm";

import appConfig from "@/appConfig";

export const MainPage = () => {
	const [tab, setTab] = useState("borrow");
	const wasFirstInited = useSelector(selectWasFirstInited);
	const { inited } = useSelector(selectParams);
	const price = useSelector(selectLinePrice);

	return (
		<div>
			<Helmet>
				<title>{appConfig.titles.default}</title>
			</Helmet>
			<div className="text-3xl font-black tracking-tight text-center text-white md:text-4xl">
				<div className="text-6xl md:text-8xl">
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0281EB] via-[white] to-[#ff433e]">
						LoL
					</span>
				</div>
				A price-protected token
			</div>

			<div className="relative flex flex-col-reverse lg:flex-row lg:space-x-5 mt-[50px] max-w-4xl mx-auto">
				<div className="z-50 h-[100%] p-3 mt-5 text-gray-400 border-2 shadow-xl lg:mt-0 basis-2/3 sm:p-5 xs:p-4 bg-gray-950 border-primary/30 shadow-gray-950 rounded-xl pb-2 xs:pb-2 sm:pb-2">
					{(wasFirstInited && inited && price) ? (
						<>
							<Tabs value={tab} onChange={(v) => setTab(v)}>
								<Tabs.Item value="borrow">Borrow</Tabs.Item>
								<Tabs.Item value="my">My loans</Tabs.Item>
								{!appConfig.TESTNET ? <Tabs.Item value="buysell">Buy/Sell</Tabs.Item> : null}
							</Tabs>

							<div className="mt-3 sm:mt-5 xs:mt-4">
								{tab === "borrow" && <OpenLoanForm />}
								{tab === "my" && <LoanList />}
								{tab === "buysell" && <EquilibreSwapForm />}
							</div>
						</>
					) : (
						<div className="pb-1 sm:pb-3 xs:pb-2">
							<Spin />
						</div>
					)}
				</div>

				<div className="text-gray-400 order-0 basis-1/3 lg:mt-0">
					<div className="p-3 border-2 shadow-xl sm:p-5 xs:p-4 bg-gray-950 border-primary/30 shadow-gray-950 rounded-xl">
						<div className="flex items-center space-x-3">
							<div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-10 h-10 stroke-primary/60"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
									/>
								</svg>
							</div>
							<div className="leading-tight">
								<span className="font-semibold text-gray-300 text-md">
									What makes the price protected?
								</span>
							</div>
						</div>

						<img src="/protectionChart.svg" className="mt-5" />

						<div className="mt-2 text-sm text-gray-300">
							If it grows, you can book a profit. If it falls, you can get
							your collateral back (less fees). You are always above a certain
							line.
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto">
				<div className="max-w-lg mt-4 text-xs text-gray-500">
					Bridge your LINE tokens to <a href="https://obyte.org" target="_blank" rel="noopener" className="text-primary">Obyte</a> and get rewarded from Kava Rise for
					just holding them. Estimated APY is 7%. Track your rewards at <a href="https://kava.obyte.org" target="_blank" rel="noopener" className="text-primary">kava.obyte.org</a>.
				</div>
			</div>
		</div>
	);
};
