import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import './App.css';
import { Auth, UnAuth } from './routes';
import SignIn from './Components/Auth/SignIn';
import SignUp from './Components/Auth/SignUp';
import CustDashboard from './Components/Dashboards/CustDashboard';
import RestDashboard from './Components/Dashboards/RestDashboard';
import DelDashboard from './Components/Dashboards/DelDashboard';
import Layout from './Components/Layout';
import CustProfile from './Components/Profiles/CustProfile';
import RestProfile from './Components/Profiles/RestProfile';
import DelProfile from './Components/Profiles/DelProfile';
import Cart from './Components/Cart';
import Orders from './Components/Orders';
import Order from './Components/Order';
import Restaurant from './Components/Restaurant';
import { setSocket, setDelQuery, setOrderDetails, setOrderAvail } from './Redux/socketSlice';
import axios from 'axios';
import { setErrorBar, setItems, setRestaurants } from './Redux/varSlice';

const theme = createMuiTheme({
	typography: {
		fontFamily: 'Quicksand',
		fontWeightLight: 400,
		fontWeightRegular: 500,
		fontWeightMedium: 600,
		fontWeightBold: 700
	}
});

function App() {
	const user = useSelector((state) => state.user);
	const orderDetails = useSelector((state) => state.socket.orderDetails);
	const filters = useSelector((state) => state.var.filters);
	const dispatch = useDispatch();
	const history = useHistory();

	useEffect(() => {
		const socket = io(process.env.REACT_APP_SERVER_URL);
		if (user) socket.emit('signin', user.uname);
		socket.on('deliveryQuery', (details) => {
			dispatch(setDelQuery({ open: true, details }));
		});
		socket.on('assigned', async (details) => {
			console.log('ASSIGNED DETAILS', details);
			console.log('ORDERDETAILS', orderDetails);
			if (orderDetails && details.order.orderno === orderDetails.order.orderno) {
				try {
					const res = await axios.get(`/orders/${details.order.orderno}`);
					console.log('ASSIGNED ORDER', res.data);
					dispatch(setOrderDetails(res.data));
				} catch (err) {
					if (err.response) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			}
		});
		socket.on('prepared', async (details) => {
			console.log(orderDetails, details);
			if (orderDetails && details.orderno === orderDetails.order.orderno) {
				try {
					const res = await axios.get(`/orders/${details.orderno}`);
					dispatch(setOrderDetails(res.data));
				} catch (err) {
					if (err.response) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			}
		});
		socket.on('received', async (details) => {
			if (orderDetails && details.orderno === orderDetails.order.orderno) {
				try {
					const res = await axios.get(`/orders/${details.orderno}`);
					dispatch(setOrderDetails(res.data));
				} catch (err) {
					if (err.response) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			}
		});
		socket.on('delivered', async (details) => {
			if (orderDetails && details.orderno === orderDetails.order.orderno) {
				try {
					const res = await axios.get(`/orders/${details.orderno}`);
					dispatch(setOrderDetails(res.data));
				} catch (err) {
					if (err.response) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			}
		});
		socket.on('paid', async (details) => {
			if (orderDetails && details.orderno === orderDetails.order.orderno) {
				try {
					const res = await axios.get(`/orders/${details.orderno}`);
					dispatch(setOrderDetails(res.data));
					if (user.type === 'delivery') dispatch(setOrderAvail(null));
				} catch (err) {
					if (err.response) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			}
		});
		socket.on('delFailed', async (details) => {
			try {
				await axios.delete(`/orders/${details.payload.orderNo}`);
				if (orderDetails && details.orderno === orderDetails.order.orderno) {
					history.replace('/');
					dispatch(setOrderDetails(null));
				}
			} catch (err) {
				if (err.response) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		});
		socket.on('restaurantOpen', async () => {
			if (user.type === 'customer') {
				let res = await axios.get('/restaurants', {
					params: filters
				});
				dispatch(setRestaurants(res.data));
				res = await axios.get('/items', {
					params: filters
				});
				dispatch(setItems(res.data));
			}
		});
		socket.on('itemAvail', async () => {
			if (user.type === 'customer') {
				const res = await axios.get('/items', {
					params: filters
				});
				dispatch(setItems(res.data));
			}
		});
		dispatch(setSocket(socket));
		return () => socket.disconnect();
	}, [dispatch, filters, history, orderDetails, user]);

	return (
		<ThemeProvider theme={theme}>
			<Router>
				<Layout>
					<Switch>
						<Route exact path='/'>
							{(user.uname && <Redirect to='/dashboard' />) ||
								(!user.uname && <Redirect to='/signin' />)}
						</Route>
						<UnAuth exact path='/signin'>
							<SignIn />
						</UnAuth>
						<UnAuth exact path='/signup'>
							<SignUp />
						</UnAuth>
						<Auth exact path='/dashboard'>
							{user.type === 'customer' && <CustDashboard />}
							{user.type === 'restaurant' && <RestDashboard />}
							{user.type === 'delivery' && <DelDashboard />}
						</Auth>
						<Auth exact path='/profile'>
							{user.type === 'customer' && <CustProfile />}
							{user.type === 'restaurant' && <RestProfile />}
							{user.type === 'delivery' && <DelProfile />}
						</Auth>
						<Auth exact path='/cart' type='customer'>
							<Cart />
						</Auth>
						<Auth exact path='/orders'>
							<Orders />
						</Auth>
						<Auth path='/orders/:order_no'>
							<Order />
						</Auth>
						<Auth exact path='/restaurants/:fssai' type='customer'>
							<Restaurant />
						</Auth>
						<Route>
							<h1>404 PAGE NOT FOUND</h1>
						</Route>
					</Switch>
				</Layout>
			</Router>
		</ThemeProvider>
	);
}

export default App;
