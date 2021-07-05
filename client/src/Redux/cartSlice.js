import { createSlice } from '@reduxjs/toolkit';

export const cartSlice = createSlice({
	name: 'cart',
	initialState: {
		fssai: null,
		cart: []
	},
	reducers: {
		emptyCart: (state) => ({ fssai: null, cart: [] }),
		setCart: (state, action) => {
			if (action.payload && action.payload.length) {
				state.cart = action.payload;
				state.fssai = action.payload[0].fssai;
			}
		},
		updateQuantity: (state, action) => {
			state.cart[action.payload.idx].quantity = action.payload.quantity;
		}
	}
});

export const { emptyCart, setCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
