import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import varReducer from './varSlice';
import socketReducer from './socketSlice';

const makeStore = (preloadedState) => {
	return configureStore({
		reducer: {
			user: userReducer,
			cart: cartReducer,
			var: varReducer,
			socket: socketReducer
		},
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false
			})
	});
};

export default makeStore;
