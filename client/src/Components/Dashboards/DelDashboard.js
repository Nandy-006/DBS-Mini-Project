import React, { useEffect } from 'react';
import { Redirect } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Grid, Typography } from '@material-ui/core';
import { setErrorBar } from '../../Redux/varSlice';
import { setOrderAvail } from '../../Redux/socketSlice';
import DelQueryDialog from '../Dialogs/DelQueryDialog';

const DelDashboard = () => {
	const delAvail = useSelector((state) => state.var.delAvail);
	const orderAvail = useSelector((state) => state.socket.orderAvail);
	const details = useSelector((state) => state.socket.delQueryDetails);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`/orders/`, { params: { check: true } });
				if (res.data.length) {
					dispatch(setOrderAvail(res.data[0].orderno));
				} else {
					dispatch(setOrderAvail(null));
				}
			} catch (err) {
				if (err.response) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		};
		fetchData();
	}, [dispatch, details]);

	return (
		<Grid container justify='center' alignItems='center' style={{ minHeight: '80vh' }}>
			<Grid item>
				{delAvail && !orderAvail && (
					<Typography variant='h3'>Waiting for Orders ...</Typography>
				)}
				{!delAvail && !orderAvail && (
					<Typography variant='h3'>You are not accepting orders</Typography>
				)}
				{orderAvail && <Redirect to={`/orders/${orderAvail}`} />}
			</Grid>
			<DelQueryDialog />
		</Grid>
	);
};

export default DelDashboard;
