import appConfig from "@/appConfig";
import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { isArray } from "lodash";

const persistConfig = {
  key: `line-ui-cache`,
  keyPrefix: appConfig.TESTNET ? "testnet:" : "livenet:",
  version: 1,
  storage,
  blacklist: [],
};

export const cacheSlice = createSlice({
  name: "cache",
  initialState: {
    pairs: [],
    tokensByPair: {}, // pairAddress -> [token0, token1]
    reservesByPair: {}, // pairAddress -> {value: [reserve0, reserve1], ts: timestamp_ms}
    decimalsByToken: {}, // token -> decimals
    fee: {
      ts: 0, // one hour we save the fee in the cache
      value: null
    },
  },
  reducers: {
    addPair: (state, action) => {
      const { inAsset, outAsset, pairContract } = action.payload;

      if (inAsset && outAsset && pairContract) {
        state.pairs.push({ inAsset, outAsset, pairContract });
      }
    },
    addPairTokens: (state, action) => {
      if ("pair" in action.payload && "tokens" in action.payload && action.payload && isArray(action.payload.tokens) && action.payload.tokens.length === 2) {
        state.tokensByPair[action.payload.pair] = action.payload.tokens;
      } else {
        throw new Error("Invalid payload");
      }
    },
    addDecimals: (state, action) => {
      if ("token" in action.payload && "decimals" in action.payload) {
        state.decimalsByToken[action.payload.token] = action.payload.decimals;
      } else {
        throw new Error("Invalid payload");
      }
    },
    updateFee: (state, action) => {
      state.fee.ts = Date.now();
      state.fee.value = action.payload.value;
    },
    addReserves: (state, action) => {
      if ("pair" in action.payload && "reserves" in action.payload && action.payload && isArray(action.payload.reserves) && action.payload.reserves.length === 2) {
        state.reservesByPair[action.payload.pair] = {
          value: action.payload.reserves,
          ts: Date.now()
        };
      } else {
        throw new Error("Invalid payload");
      }
    }
  }
});

export const {
  addPair,
  addPairTokens,
  addDecimals,
  updateFee,
  addReserves
} = cacheSlice.actions;

export default persistReducer(persistConfig, cacheSlice.reducer);

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectPairs = (state) => state.cache.pairs;
export const selectDecimalsByToken = (state) => state.cache.decimalsByToken;
