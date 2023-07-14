import {
	Routes,
	Route,
	unstable_HistoryRouter as HistoryRouter,
} from "react-router-dom";
import { Suspense } from "react";

import { Layout } from "./components/templates/Layout/Layout";
import { historyInstance } from "./historyInstance";
import { AboutPage, FaqPage, MainPage, MarketPage, StakingPage } from "./pages";

// TODO: add spin to Suspense
export const AppRouter = () => {
	return (
		<HistoryRouter history={historyInstance}>
			<Layout>
				<Suspense fallback={<span>Loading...</span>}>
					<Routes>
						<Route path="/" element={<MainPage />} />
						<Route path="/staking" element={<StakingPage />} />
						<Route path="/market" element={<MarketPage />} />
						<Route path="/market/:type/:id" element={<MarketPage />} />
						<Route path="/faq" element={<FaqPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/staking/*" element={<StakingPage />} />
					</Routes>
				</Suspense>
			</Layout>
		</HistoryRouter>
	);
};
