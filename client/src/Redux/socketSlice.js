import { createSlice } from '@reduxjs/toolkit';

export const socketSlice = createSlice({
	name: 'socket',
	initialState: {
		socket: null,
		openDelQuery: false,
		delQueryDetails: null,
		orderAvail: null,
		orderDetails: null
	},
	reducers: {
		setSocket: (state, action) => {
			state.socket = action.payload;
		},
		setDelQuery: (state, action) => {
			state.openDelQuery = action.payload.open;
			state.delQueryDetails = action.payload.details;
		},
		setOrderAvail: (state, action) => {
			state.orderAvail = action.payload;
		},
		setOrderDetails: (state, action) => {
			console.log('SETTING ORDER DETAILS', action.payload);
			state.orderDetails = action.payload;
		}
	}
});

export const { setSocket, setDelQuery, setOrderAvail, setOrderDetails } = socketSlice.actions;
export default socketSlice.reducer;
