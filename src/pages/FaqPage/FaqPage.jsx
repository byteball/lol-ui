import { Disclosure } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { PageLayout } from "@/components/templates";
import appConfig from "@/appConfig";

const faqs = [
	{
		question: "How can I make money with LINE?",
		answer: (
			<div>
				<p>
					The simplest way takes advantage of the Kava Rise program which
					rewards dapps for their TVL on Kava. We have two such dapps:
					{" "}<a href="https://counterstake.org" target="_blank" rel="noopener" className="text-primary">Counterstake bridge</a> and LINE. You would contribute to the TVL of both
					dapps, thus making every dollar of your capital work twice.
				</p>
				Follow these steps:
				<ol>
					<li>
						Bridge your GBYTEs from <a href="https://obyte.org" target="_blank" rel="noopener" className="text-primary">Obyte</a> to Kava over <a href="https://counterstake.org" target="_blank" rel="noopener" className="text-primary">Counterstake bridge</a> (if
						you are already an Obyte user. Otherwise, you can buy GBYTEs on{" "}
						<a href="https://equilibrefinance.com/" target="_blank" rel="noopener" className="text-primary">Equilibre DEX</a> on Kava).
					</li>
					<li>Use your GBYTE-on-Kava to borrow LINE tokens here.</li>
					<li>Bridge your LINE tokens (back) to Obyte.</li>
					<li>
						Hold your LINE tokens in your Obyte wallet. Kava rise rewards dapps
						for their TVL on the Kava network. We receive these rewards monthly
						and distribute 90% of them to users who bridged their tokens from
						Kava to Obyte (which you did). You’ll receive your share of rewards
						monthly to your Obyte wallet, you don’t have to do anything else. Track your rewards at <a href="https://kava.obyte.org" target="_blank" rel="noopener" className="text-primary">kava.obyte.org</a>.
					</li>
					<li>
						When you want to get your collateral back, bridge your LINE tokens
						back to Kava, get your GBYTEs back by repaying the loan on this
						website (you’ll need to buy some additional LINE tokens from the
						market to pay for the fees and the accrued interest), and bridge the
						received GBYTEs back to Obyte. If the LINE price has grown since you
						opened the loan, you can sell your LINE tokens on the market instead
						of repaying the loan. In this case, you would get more GBYTEs than
						originally invested.
					</li>
				</ol>
				<p>
					The income you receive depends on the amount of Kava Rise rewards and
					the price of the LINE token. Kava pays 1 million Kava tokens monthly
					to all participating dapps in proportion to their TVL. This is roughly
					$1m per month at the current exchange rate. Assuming the APY of Kava
					Rise is 7% (as it has been lately) and the price of LINE tokens
					doesn’t change relative to GBYTE, you would get 14% per year.
				</p>
				Your expenses are:
				<ol>
					<li>
						Fees paid for bridging through Counterstake: 1% for each transfer.
						You need two transfers to open a position, and two to close. You can
						avoid these fees entirely if you self-claim on Conterstake
						(transfers would take 3 days instead of near-immediate and you’ll
						need capital on the destination chain).
					</li>
					<li>
						Origination fee paid for opening a loan: currently 1%. This is a
						one-time fee.
					</li>
					<li>Interest paid for the loan: currently 1% per year.</li>
				</ol>
				<p>
					Since most of the fees are one-time, the strategy is most profitable
					if you hold LINE tokens for a long time. If you pay all Counterstake
					fees and assuming 14% rewards, your net income after 1 year would be
					8%. After 2 years: 21%.
				</p>
				<p>
					This is only one strategy that bears the minimum risk (in our
					opinion). You can also trade LINE like any other token and try to gain
					from its price movements. Also, you can trade loans, which are put
					options (represented as NFTs), and try to gain from their price
					movements or market inefficiencies. We view these strategies as more
					risky and more advanced.
				</p>
			</div>
		),
	},
	{
		question: "What are the risks?",
		answer: (
			<div>
				<p>
					There are standard risks like smart contract risk (both LINE and
					Counterstake) and general risks of the underlying network.
				</p>
				<p>
					The biggest risk, in our opinion, is the risk that LINE price goes
					down significantly after you borrow. This would reduce the TVL locked
					in Counterstake and the rewards you receive from Kava Rise.
				</p>
				<p>
					However your capital remains protected — you can always pay back the
					loan and get the original collateral back (less fees).
				</p>
				<p>
					If the LINE price grows however, you would get larger rewards and
					would be able to earn from the price growth by selling your LINEs.
				</p>
			</div>
		),
	},
	{
		question: "What is Kava Rise?",
		answer: (
			<div>
				<p>
					<a href="https://www.kava.io/rise/developer-rewards" target="_blank" rel="noopener" className="text-primary">Kava Rise</a> is an initiative of Kava network to reward dapps that
					contribute to Kava’s TVL. Kava gives out 1,000,000 KAVA tokens
					(roughly $1m at the current exchange rate) every month to developers
					of all participating dapps in proportion to their share of <a href="https://defillama.com/chain/Kava" target="_blank" rel="noopener" className="text-primary">Kava's
						total TVL as determined by DefiLlama</a>.
				</p>
				<p>
					Our dapps LINE and <a href="https://counterstake.org" target="_blank" rel="noopener" className="text-primary">Counterstake</a> participate in this program and get a
					share of these rewards. While the teams of some other participating
					dapps keep their Kava Rise rewards in their treasuries, we convert
					them to GBYTE and distribute 90% of the rewards to the users who
					actually contribute TVL and bridge their tokens to Obyte.
				</p>
				<p>
					The latest APY of Kava TVL is about 7% but LINE holders have an
					opportunity to double it by locking both GBYTE in order to borrow LINE
					tokens here, and then locking LINE tokens in the Counterstake bridge
					in order to bridge them to Obyte.
				</p>
			</div>
		),
	},
	{
		question: "What makes LINE token special?",
		answer: (
			<div>
				<p>
					It’s price-protected if you borrow it (but not if you buy). When you
					borrow, you get both LINE tokens and a right to repay the loan and get
					your collateral back (minus fees) if the token’s price falls.
				</p>
				<p>
					This loan is like a put option, which is commonly used for hedging
					long positions. Options are not free, they have to be paid for, even
					if eventually not used. Likewise, you pay for the hedge by paying the
					origination fee and interest.
				</p>
				<p>
					So, when you borrow LINE tokens you get a “package” of both the tokens
					and the hedge against price drop, and you don’t have to bother about
					buying the hedge separately (which is not always possible).
				</p>
				<p>
					If you feel like you don’t need the hedge, you can sell it{" "}
					<Link to="/market" className="text-primary">
						on the market
					</Link>{" "}
					for profit and hold the token alone.
				</p>
			</div>
		),
	},
	{
		question: "How do I hedge my LINE positions?",
		answer: (
			<div>
				<p>
					If you hold LINE tokens and want to hedge against the risk of LINE
					price falling, you can buy a hedge on{" "}
					<Link to="/market" className="text-primary">
						the market page
					</Link>
					. A hedge is a loan opened by someone else who later decided to sell
					the loan separately from their LINE tokens. The total amount of the
					loans you buy should match the amount of LINE tokens you hold and wish
					to hedge.
				</p>
				<p>
					You need to buy a hedge only if you obtained your LINE tokens by
					buying them on the market. If you obtained them by opening a loan, you
					already hold a hedge that matches your LINE position.
				</p>
			</div>
		),
	},
	{
		question: "What is strike price?",
		answer: (
			<div>
				<p>
					For put options, strike price is the price at which you can sell an
					asset, that is LINE tokens for GBYTE. Every loan here is a put option, and
					the strike price shows how many GBYTEs you would get per 1 LINE token
					if you were to repay the loan.
				</p>
				<p>
					When you open a loan, the initial strike price is the market price of
					LINE tokens, minus the origination fee.
				</p>
				<p>
					As interest accrues on your loan, its strike price gradually
					decreases. This decrease reflects the cost of keeping your hedge open
					and protecting your LINE position.
				</p>
			</div>
		),
	},
	{
		question: "What’s the maximum supply of LINE?",
		answer: (
			<div>
				<p>
					It’s unlimited. New LINE tokens are issued (borrowed) by users in
					exchange for locking their GBYTE as collateral. When they repay the
					loans, LINE tokens are removed from circulation and destroyed. Because
					of interest and fees, users have to repay more LINE tokens than they
					have borrowed, so the supply shrinks even more than it was expanded
					while borrowing.
				</p>
			</div>
		),
	},
	{
		question: "What supports the price of LINE?",
		answer: (
			<div>
				<p>Users who repay the loans provide demand for LINE tokens.</p>
				<p>
					To pay fees and interest, they need more tokens than they borrowed.
					They can get the additional LINE tokens in two ways: either by
					borrowing more (and paying the origination fee) or by buying them from
					the market. If the latter option is cheaper, they choose it, and their
					buying supports the price.
				</p>
			</div>
		),
	},
	{
		question: "What price is used when opening a loan?",
		answer: (
			<div>
				<p>
					To determine how many LINE tokens you can borrow for your collateral,
					we use the latest market price of <a href="https://equilibrefinance.com/pools/manage/0xfb1efb5fd9dfb72f40b81bc5aa0e15d616ba8831" target="_blank" rel="noopener" className="text-primary">LINE on Equilibre DEX</a> in combination
					with time-weighted average price (TWAP) over the last day. To prevent
					price manipulation, we use the higher of the latest market and TWAP
					prices.
				</p>
			</div>
		),
	},
	{
		question:
			"What happens if the LINE price grows and the loan value exceeds my collateral?",
		answer: (
			<div>
				<p>
					Nothing. Unlike other CDP (collateral debt position) based DeFi apps,
					such as DAI, you are not liquidated. You can sell your LINE tokens on
					the market for profit and forget about your loan. Or, you can continue
					holding your LINE tokens hoping that the price grows even more. If you
					sold, and then the price of LINE goes below the collateral value, you
					can buy LINE from the market and repay the loan, again for profit.
				</p>
			</div>
		),
	},
	{
		question:
			"How can I be sure I can always get my collateral back?",
		answer: (
			<div>
				<p>
					Your GBYTE collateral is stored on a <a href="https://explorer.kava.io/address/0x31f8d38df6514b6cc3C360ACE3a2EFA7496214f6" target="_blank" rel="noopener" className="text-primary">smart contract</a> and nobody, even Obyte team, have access to your collateral. Only you can withdraw it by repaying your loan. The smart contract is not upgradeable, so no surprises. The team can only update the origination fee, the interest rate, the oracle used for determining the LINE price, the exchange fee, and the rewards for the incentivized pools.
				</p>
			</div>
		),
	},
	{
		question: "What are these NFTs I can trade here?",
		answer: (
			<div>
				<p>
					They are loans. Each loan you open here is a non-fungible token. You
					can keep the LINE tokens you borrowed and sell the loan to another
					user, so that that other user will have the right (but not an
					obligation) to repay the loan and claim its collateral — effectively
					selling LINE for GBYTE at a set price (known as strike price).
				</p>
				<p>
					This right to sell LINE for a set price makes it a put option — a
					well-known trading instrument used to hedge one’s positions. Its
					holder has something like an insurance against the price falling below
					some level.
				</p>
				<p>
					Unlike most other NFTs you hear about, these NFTs are utility NFTs,
					not collectibles (at least, not supposed to be collectibles). Their
					price is determined by the market based on their utility as a hedging
					instrument.
				</p>
			</div>
		),
	},
	{
		question: "Can I earn by providing liquidity?",
		answer: (
			<div>
				Yes, there is liquidity mining here. You can provide liquidity to some
				pools on Equilibre DEX trading LINE, stake your LP tokens on{" "}
				<Link to="/staking/all" className="text-primary">
					the staking page
				</Link>{" "}
				and get rewards in LINE tokens. You can also just stake your LINE tokens and get a share of rewards. The rewards are funded by fees collected
				from borrowers. Eligible pools and tokens are listed on{" "}
				<Link to="/staking/all" className="text-primary">
					the staking page
				</Link>
				.
			</div>
		),
	},
];

export const FaqPage = () => (
	<PageLayout
		title="F.A.Q."
		description={
			<span>
				Can't find the answer you're looking for? Ask on{" "}
				<a href="https://discord.obyte.org" target="_blank" rel="noopener" className="text-primary/70">
					Obyte discord
				</a>
				.
			</span>
		}
	>
		<Helmet>
			<title>{appConfig.titles.faq}</title>
		</Helmet>

		<div className="space-y-8 divide-y divide-primary/10">
			{faqs.map((faq) => (
				<div key={faq.question} className="pt-6">
					<div>
						<div className="flex items-start justify-between w-full max-w-2xl text-2xl font-semibold leading-8 text-left text-white">
							{faq.question}
						</div>
						<div className="pr-12 mt-2">
							<p className="text-base leading-7 prose prose-2xl text-gray-300">
								{faq.answer}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	</PageLayout>
);
