import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

import { AppRouter } from "./AppRouter.jsx";

import "./index.css";

import getStore from "./store";
// import { bootstrap } from "./bootstrap";
export const { store, persistor } = getStore();

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<HelmetProvider>
			<PersistGate loading={<span>Loading...</span>} persistor={persistor}>
				<AppRouter />
			</PersistGate>
		</HelmetProvider>
	</Provider>
);
