import { createSlice } from "@reduxjs/toolkit";
import { saveAddressAndLoadLoans } from "../thunks/saveAddressAndLoadLoans";
import { logout } from "./settingsSlice";

export const loansSlice = createSlice({
	name: "loans",
	initialState: {
		data: [],
		loading: true,
	},
	reducers: {
		addNewLoan: (state, action) => {
			state.data.push(action.payload);
		},
		removeLoan: (state, action) => {
			state.data = state.data.filter(
				({ loan_num }) => Number(loan_num) !== action.payload
			);
		},
	},
	extraReducers: (builder) => {
		builder.addCase(saveAddressAndLoadLoans.fulfilled, (state, action) => {
			state.data = action.payload?.loans || [];
			state.loading = false;
		});

		builder.addCase(logout, (state) => {
			state.data = [];
			state.loading = false;
		});
	},
});

export const { addNewLoan, removeLoan } = loansSlice.actions;

export default loansSlice.reducer;

export const selectLoans = (state) => state.loans.data;
export const selectLoansLoading = (state) => state.loans.loading;
