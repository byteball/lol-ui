import { createAsyncThunk } from "@reduxjs/toolkit";

export const sendNotification = createAsyncThunk(
	"sendNotification",
	async (notificationObject, { dispatch }) => {
		if (notificationObject) {
			const id = new Date().getTime();
			const { dismissNotification } = await import(
				"@/store/slices/notificationsSlice"
			);

			setTimeout(() => {
				dispatch(dismissNotification(id));
			}, notificationObject.dismissAfter || 3000);

			return {
				id,
				...notificationObject,
			};
		}
	}
);
