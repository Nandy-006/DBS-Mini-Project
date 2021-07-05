import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import axios from 'axios';
import './index.css';
import App from './App';
import store from './Redux/store';

const checkSignedIn = async () => {
	const res = await axios.get('/session');
	const user = res.data.user;
	let preloadedState = {};
	if (user) {
		preloadedState = { user };
		if (user.type === 'delivery') {
			const res = await axios.get('/profile');
			if (res.data.delivery.isavail) preloadedState.var = { delAvail: true };
		}
	}
	return preloadedState;
};

const renderApp = (preloadedState) => {
	ReactDOM.render(
		<React.StrictMode>
			<Provider store={store(preloadedState)}>
				<App />
			</Provider>
		</React.StrictMode>,
		document.getElementById('root')
	);
};

(async () => renderApp(await checkSignedIn()))();
