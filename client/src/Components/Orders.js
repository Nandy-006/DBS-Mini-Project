import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import axios from 'axios';
import OrderHistoryTable from './Tables/OrderHistoryTable';
import { setErrorBar } from '../Redux/varSlice';

const Orders = () => {
	const [orders, setOrders] = useState([]);

	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				try {
					const res = await axios.get('/orders');
					setOrders(res.data);
				} catch (err) {
					if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
					else console.log(err);
				}
			} catch (err) {}
		};
		fetchData();
	}, [dispatch]);

	return (
		<Grid
			container
			direction='column'
			justify='center'
			alignItems='center'
			spacing={4}
			style={{ marginTop: 2 }}
		>
			<Grid item>
				<Typography variant='h3' style={{ fontWeight: 500 }}>
					ORDER HISTORY
				</Typography>
			</Grid>
			<Grid item>
				<OrderHistoryTable orders={orders} />
			</Grid>
		</Grid>
	);
};

export default Orders;
