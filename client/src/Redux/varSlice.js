import { createSlice } from '@reduxjs/toolkit';

export const varSlice = createSlice({
	name: 'var',
	initialState: {
		loading: false,
		errorBar: false,
		errorMessage: '',
		successBar: false,
		succesMessage: '',
		infoBar: false,
		infoMessage: '',
		delAvail: false,
		filters: {
			name: null,
			veg: false,
			cuisines: [],
			mealTypes: []
		},
		items: [],
		restaurants: []
	},
	reducers: {
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
		setErrorBar: (state, action) => {
			state.errorBar = !state.errorBar;
			state.errorMessage = action.payload;
		},
		setSuccessBar: (state, action) => {
			state.successBar = !state.successBar;
			state.successMessage = action.payload;
		},
		setInfoBar: (state, action) => {
			state.infoBar = !state.infoBar;
			state.infoMessage = action.payload;
		},
		changeDelAvail: (state, action) => {
			state.delAvail = action.payload;
		},
		setFilters: (state, action) => {
			state.filters = action.payload;
		},
		setItems: (state, action) => {
			state.items = action.payload;
		},
		setRestaurants: (state, action) => {
			state.restaurants = action.payload;
		}
	}
});

export const {
	setLoading,
	changeDelAvail,
	setFilters,
	setItems,
	setRestaurants,
	setErrorBar,
	setSuccessBar,
	setInfoBar
} = varSlice.actions;
export default varSlice.reducer;
