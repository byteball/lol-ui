import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import ReactGA from "react-ga4";

import { AppRouter } from "./AppRouter.jsx";

import "./index.css";

import getStore from "./store";
import appConfig from "./appConfig.js";

export const { store, persistor } = getStore();

if (appConfig.GA_MEASUREMENT_ID) {
	console.log('log: GA inited');
	ReactGA.initialize(appConfig.GA_MEASUREMENT_ID);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<HelmetProvider>
			<PersistGate loading={<span>Loading...</span>} persistor={persistor}>
				<AppRouter />
			</PersistGate>
		</HelmetProvider>
	</Provider>
);
