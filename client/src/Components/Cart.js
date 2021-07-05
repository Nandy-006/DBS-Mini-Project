import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
	Button,
	Grid,
	makeStyles,
	Typography,
	Dialog,
	DialogTitle,
	DialogActions
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CartTable from './Tables/CartTable';
import DoneIcon from '@material-ui/icons/Done';
import { emptyCart, setCart } from '../Redux/cartSlice';
import { setErrorBar, setInfoBar, setSuccessBar } from '../Redux/varSlice';
import MapDialog from './Dialogs/MapDialog';

const useStyles = makeStyles((theme) => ({
	root: {
		margin: theme.spacing(2)
	},
	bold: {
		fontWeight: 'bold'
	}
}));

const Cart = () => {
	const classes = useStyles();

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [mapOpen, setMapOpen] = useState(false);

	const cart = useSelector((state) => state.cart.cart);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get('/cart');
				if (res.data.length) dispatch(setCart(res.data));
				else dispatch(emptyCart());
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		};
		fetchData();
	}, [dispatch]);

	const handlePlaceOrder = async (coordinates) => {
		if (coordinates) {
			try {
				await axios.patch('/profile', { type: coordinates });
				await axios.post('/cart');
				dispatch(emptyCart());
				dispatch(setSuccessBar('Order Placed!'));
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		} else dispatch(setInfoBar('Enter location to place order'));
	};

	const handleDeleteCart = async (confirm) => {
		if (confirm) {
			try {
				await axios.delete('/cart');
				dispatch(emptyCart());
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		} else setConfirmOpen(true);
	};

	return (
		<>
			{!cart.length && (
				<Grid container justify='center' alignItems='center' style={{ minHeight: '80vh' }}>
					<Grid item>
						<Typography variant='h4'>CART IS EMPTY</Typography>
					</Grid>
				</Grid>
			)}
			{cart.length && (
				<Grid
					container
					direction='column'
					justify='center'
					alignItems='center'
					className={classes.root}
					spacing={2}
				>
					<Grid item>
						<Typography variant='h4' className={classes.bold}>
							YOUR CART
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant='h5' className={classes.bold}>
							Ordering from {cart[0].restaurant}
						</Typography>
					</Grid>
					<Grid item style={{ margin: '10px' }}>
						<CartTable deleteCart={handleDeleteCart} />
					</Grid>
					<Grid item>
						<Grid container justify='space-between' alignItems='center' spacing={4}>
							<Grid item>
								<Button
									variant='contained'
									color='secondary'
									startIcon={<DeleteIcon />}
									onClick={() => {
										handleDeleteCart(false);
									}}
								>
									Empty cart
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant='contained'
									color='primary'
									startIcon={<DoneIcon />}
									onClick={() => setMapOpen(true)}
								>
									Place order
								</Button>
							</Grid>
							<MapDialog
								open={mapOpen}
								setOpen={setMapOpen}
								handleComplete={handlePlaceOrder}
							/>
							<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
								<DialogTitle>Are you sure you want to empty the cart?</DialogTitle>
								<DialogActions>
									<Button
										color='primary'
										variant='contained'
										onClick={() => {
											handleDeleteCart(true);
										}}
									>
										Yes, Empty It
									</Button>
									<Button
										color='primary'
										variant='contained'
										onClick={() => setConfirmOpen(false)}
									>
										Cancel
									</Button>
								</DialogActions>
							</Dialog>
						</Grid>
					</Grid>
				</Grid>
			)}
		</>
	);
};

export default Cart;
