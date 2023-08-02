import { Helmet } from "react-helmet-async";

import { PageLayout } from "@/components/templates";

export const AboutPage = () => (
	<PageLayout
		title="About us"
		description={<span>
			LINE token was created by developers of <a href="https://obyte.org" target="_blank" rel="noopener" className="text-primary">Obyte</a> — a DAG based distributed ledger. In Obyte DAG, unlike blockchains, there are no miners (block producers) and users have direct access to the ledger, without any intermediaries.This absence of big power centers makes DAG censorship-resistant, more decentralized, and eliminates MEV (miner extractable value).
		</span>}
	>
		<Helmet>
			<title>LINE token — About us</title>
		</Helmet>

		<p className="mb-5 text-white/60">
			We’ve created other unique applications, most of which are available only
			on Obyte:
		</p>

		<div className="mx-auto space-y-10">
			<div className="flex flex-col items-center justify-between p-8 space-x-5 lg:flex-row bg-primary/10 rounded-xl">
				<div className="order-2 lg:order-1 basis-1 lg:basis-1/2">
					<div className="mb-2 text-2xl font-semibold">Counterstake Bridge</div>
					<div className="lg:max-w-[500px] mb-5">
						A truly decentralized cross-chain bridge that connects Obyte and
						EVM-based networks.
					</div>
					<div>
						<a
							href="https://counterstake.org/"
							className="text-primary"
							target="_blank"
							rel="noopener"
						>
							counterstake.org
						</a>
					</div>
				</div>

				<div className="flex justify-center order-1 basis-1 lg:order-2 lg:basis-1/2">
					<div className="flex justify-center mb-5 overflow-hidden opacity-50 lg:mb-0">
						<img
							className="w-full max-w-[150px]"
							src="/counterstake.svg"
							alt="Counterstake"
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-between order-1 p-8 space-x-5 lg:flex-row bg-primary/10 rounded-xl">
				<div className="flex justify-center basis-1 lg:basis-1/2">
					<div className="flex justify-center mb-5 overflow-hidden opacity-50 lg:mb-0">
						<img
							src="/oswap.svg"
							className="w-full max-w-[100px]"
							alt="oswap"
						/>
					</div>
				</div>

				<div className="basis-1 lg:basis-1/2">
					<div className="mb-2 text-2xl font-semibold">Oswap</div>
					<div className="lg:max-w-[500px] mb-5">
						A DEX that provides increased yields for LPs and leveraged trading
						without liquidations for traders.
					</div>
					<div>
						<a
							href="https://oswap.io/"
							className="text-primary"
							target="_blank"
							rel="noopener"
						>
							oswap.io
						</a>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-between p-8 space-x-5 lg:flex-row bg-primary/10 rounded-xl">
				<div className="order-2 basis-1 lg:basis-1/2 lg:order-1">
					<div className="mb-2 text-2xl font-semibold">Kivach</div>
					<div className="lg:max-w-[500px] mb-5">
						A cascading donations platform to help fund open-source projects on
						github.
					</div>
					<div>
						<a
							href="https://kivach.org/"
							className="text-primary"
							target="_blank"
							rel="noopener"
						>
							kivach.org
						</a>
					</div>
				</div>

				<div className="flex justify-center order-1 basis-1 lg:basis-1/2 lg:order-2">
					<div className="flex justify-center mb-5 overflow-hidden opacity-50 lg:mb-0">
						<img
							src="/kivach.svg"
							className="w-full max-w-[100px]"
							alt="kivach"
						/>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-between p-8 space-x-5 lg:flex-row bg-primary/10 rounded-xl">
				<div className="flex justify-center basis-1 lg:basis-1/2 ">
					<div className="flex justify-center mb-5 overflow-hidden opacity-50 lg:mb-0">
						<img
							src="/prophet.svg"
							className="w-full max-w-[100px]"
							alt="oswap"
						/>
					</div>
				</div>

				<div className="basis-1 lg:basis-1/2 ">
					<div className="mb-2 text-2xl font-semibold">Prophet</div>
					<div className="lg:max-w-[500px] mb-5">
						A prediction markets platform based on bonding curves for trading
						sports bets, currency predictions, and any other events. Liquidity
						provider APYs often exceed 100%.
					</div>
					<div>
						<a
							href="https://prophet.ooo/"
							className="text-primary"
							target="_blank"
							rel="noopener"
						>
							prophet.ooo
						</a>
					</div>
				</div>
			</div>
		</div>
	</PageLayout>
);
