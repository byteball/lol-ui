import {
	combineReducers,
	configureStore,
	getDefaultMiddleware,
} from "@reduxjs/toolkit";

import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";

import notificationsSlice from "./slices/notificationsSlice";
import settingsSlice from "./slices/settingsSlice";
import paramsSlice from "./slices/paramsSlice";
import loansSlice from "./slices/loansSlice";
import poolsSlice from "./slices/poolsSlice";
import marketSlice from "./slices/marketSlice";
import priceSlice from "./slices/priceSlice";
import cacheSlice from "./slices/cacheSlice";

const rootReducer = combineReducers({
	notifications: notificationsSlice,
	settings: settingsSlice,
	params: paramsSlice,
	loans: loansSlice,
	pools: poolsSlice,
	market: marketSlice,
	price: priceSlice,
	cache: cacheSlice
});

const getStore = () => {
	const store = configureStore({
		reducer: rootReducer,
		middleware: getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
	});

	const persistor = persistStore(store);

	return { store, persistor };
};

export default getStore;

export const getPersist = (state) => state._persist;
