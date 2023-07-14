import { createSlice } from "@reduxjs/toolkit";
import { updatePrice } from "../thunks/updatePrice";

export const priceSlice = createSlice({
	name: "price",
	initialState: 0,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(updatePrice.fulfilled, (_, action) => {
			return action?.payload || 0;
		});
	},
});

export default priceSlice.reducer;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.auth.value)`

export const selectLinePrice = (state) => state.price;
