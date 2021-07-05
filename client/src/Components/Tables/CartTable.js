import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Link,
	makeStyles,
	IconButton
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';
import { setCart, updateQuantity } from '../../Redux/cartSlice';

const useStyles = makeStyles((theme) => ({
	link: {
		color: 'inherit',
		'&:hover': {
			textDecoration: 'none'
		}
	}
}));

const CartTable = ({ deleteCart }) => {
	const classes = useStyles();

	const cart = useSelector((state) => state.cart.cart);
	const fssai = useSelector((state) => state.cart.fssai);
	const dispatch = useDispatch();

	const handleDelete = async (itemno) => {
		if (cart.length === 1 && cart[0].itemno === itemno) deleteCart(true);
		else {
			try {
				await axios.delete(`/cart/${itemno}`, { data: { fssai } });
				const newCart = cart.filter((cartItem) => cartItem.itemno !== itemno);
				dispatch(setCart(newCart));
			} catch (err) {
				console.log(err.response.message);
			}
		}
	};

	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>
							<b>Item name</b>
						</TableCell>
						<TableCell align='center'>
							<b>Quantity</b>
						</TableCell>
						<TableCell>
							<b>Price</b>
						</TableCell>
						<TableCell>
							<b>Total Price</b>
						</TableCell>
						<TableCell>
							<b>Delete</b>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{cart.map((cartItem, i) => {
						if (parseInt(cartItem.quantity) > 0) {
							return (
								<TableRow key={cartItem.itemno}>
									<TableCell>
										<Link
											href='#'
											onClick={() => console.log(cartItem.itemname)}
											className={classes.link}
										>
											{cartItem.itemname}
										</Link>
									</TableCell>
									<TableCell align='center'>
										<IconButton
											color='inherit'
											onClick={async () => {
												if (parseInt(cart[i].quantity) > 1) {
													try {
														await axios.patch(
															`/cart/${cartItem.itemno}`,
															{
																quantity:
																	parseInt(cart[i].quantity) - 1,
																fssai
															}
														);
														dispatch(
															updateQuantity({
																idx: i,
																quantity:
																	parseInt(cart[i].quantity) - 1
															})
														);
													} catch (err) {
														if (err.response.data.message)
															dispatch(
																setErrorBar(
																	err.response.data.message
																)
															);
														else console.log(err);
													}
												} else await handleDelete(cartItem.itemno);
											}}
										>
											<RemoveIcon />
										</IconButton>
										{cartItem.quantity}
										<IconButton
											color='inherit'
											onClick={async () => {
												try {
													await axios.patch(`/cart/${cartItem.itemno}`, {
														quantity: parseInt(cart[i].quantity) + 1,
														fssai
													});
													dispatch(
														updateQuantity({
															idx: i,
															quantity: parseInt(cart[i].quantity) + 1
														})
													);
												} catch (err) {
													if (err.response.data.message)
														dispatch(
															setErrorBar(err.response.data.message)
														);
													else console.log(err);
												}
											}}
										>
											<AddIcon />
										</IconButton>
									</TableCell>
									<TableCell>{cartItem.price}</TableCell>
									<TableCell>{cartItem.quantity * cartItem.price}</TableCell>
									<TableCell>
										<IconButton
											color='inherit'
											onClick={() => handleDelete(cartItem.itemno)}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						}
						return null;
					})}
				</TableBody>
				<TableHead>
					<TableRow>
						<TableCell>
							<b>Grand Total</b>
						</TableCell>
						<TableCell align='center'>
							<b>
								{cart.reduce(
									(quantity, cartItem) => quantity + parseInt(cartItem.quantity),
									0
								)}
							</b>
						</TableCell>
						<TableCell></TableCell>
						<TableCell>
							<b>
								{cart.reduce(
									(price, cartItem) => price + cartItem.price * cartItem.quantity,
									0
								)}
							</b>
						</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
			</Table>
		</TableContainer>
	);
};

export default CartTable;
