import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
	name: 'user',
	initialState: {
		uname: null,
		type: null
	},
	reducers: {
		signin: (state, action) => {
			state.uname = action.payload.uname;
			state.type = action.payload.type;
		},
		signout: (state) => {
			state.uname = null;
			state.type = null;
		}
	}
});

export const { signin, signout } = userSlice.actions;
export default userSlice.reducer;
