import {
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableBody,
	makeStyles,
	Link,
	Button
} from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ViewMapDialog from '../Dialogs/ViewMapDialog';
import DoneIcon from '@material-ui/icons/Done';
import { setErrorBar } from '../../Redux/varSlice';
import axios from 'axios';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
	link: {
		color: 'inherit',
		'&:hover': {
			textDecoration: 'none'
		}
	},
	text: {
		fontSize: 16
	},
	table: {
		minWidth: '60vw'
	}
}));

const OrderContentTable = ({ order_content, order_no, order }) => {
	const classes = useStyles();

	const [openMap, setOpenMap] = useState(false);
	const orderAvail = useSelector((state) => state.socket.orderAvail);
	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	const history = useHistory();

	const handleDelivery = async () => {
		try {
			await axios.patch(`/orders/${order_no}`, { isdelivered: true });
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const handlePaid = async () => {
		try {
			await axios.patch(`/orders/${order_no}`, { ispaid: true });
			history.push('/');
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	return (
		<TableContainer>
			<Table className={classes.table}>
				<TableHead>
					{!orderAvail && !(user.type === 'customer' && !order.isdelivered) && (
						<TableRow>
							<TableCell colSpan={4} align='center' style={{ fontSize: '20pt' }}>
								<b>Order #{order_no}</b>
							</TableCell>
						</TableRow>
					)}
					{orderAvail && (
						<TableRow>
							<TableCell colSpan={2} align='center' style={{ fontSize: '20pt' }}>
								<b>Order #{order_no}</b>
							</TableCell>
							<TableCell
								colSpan={order.isdelivered ? 1 : 2}
								align='center'
								style={{ fontSize: '20pt' }}
							>
								<Button
									variant='contained'
									color='primary'
									onClick={() => setOpenMap(true)}
								>
									View Map
								</Button>
							</TableCell>
							{order.isdelivered && (
								<TableCell align='center' style={{ fontSize: '20pt' }}>
									<Button
										variant='contained'
										color='primary'
										startIcon={<DoneIcon />}
										onClick={handlePaid}
									>
										Paid
									</Button>
								</TableCell>
							)}
							<ViewMapDialog open={openMap} setOpen={setOpenMap} />
						</TableRow>
					)}
					{user.type === 'customer' && !order.isdelivered && (
						<TableRow>
							<TableCell colSpan={2} align='center' style={{ fontSize: '20pt' }}>
								<b>Order #{order_no}</b>
							</TableCell>
							<TableCell colSpan={2} align='center' style={{ fontSize: '20pt' }}>
								<Button
									variant='contained'
									color='primary'
									startIcon={<DoneIcon />}
									onClick={handleDelivery}
								>
									Delivered
								</Button>
							</TableCell>
						</TableRow>
					)}
				</TableHead>
				<TableHead>
					<TableRow>
						<TableCell className={classes.text}>
							<b>Item name</b>
						</TableCell>
						<TableCell align='center' className={classes.text}>
							<b>Quantity</b>
						</TableCell>
						<TableCell className={classes.text}>
							<b>Price</b>
						</TableCell>
						<TableCell className={classes.text}>
							<b>Total Price</b>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{order_content.map((item, i) => {
						return (
							<TableRow key={item.itemno}>
								<TableCell className={classes.text}>
									<Link
										href='#'
										onClick={() => console.log(item.itemname)}
										className={classes.link}
									>
										{item.itemname}
									</Link>
								</TableCell>
								<TableCell align='center' className={classes.text}>
									{item.quantity}
								</TableCell>
								<TableCell className={classes.text}>{item.price}</TableCell>
								<TableCell className={classes.text}>
									{item.quantity * item.price}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
				<TableRow>
					<TableCell colspan={3} className={classes.text}>
						<i>Delivery charges</i>
					</TableCell>
					<TableCell className={classes.text}>{order.del_charge}</TableCell>
					<TableCell className={classes.text}></TableCell>
				</TableRow>
				<TableHead>
					<TableRow>
						<TableCell className={classes.text}>
							<b>Grand Total</b>
						</TableCell>
						<TableCell align='center' className={classes.text}>
							<b>
								{order_content.reduce(
									(quantity, item) => quantity + parseInt(item.quantity),
									0
								)}
							</b>
						</TableCell>
						<TableCell className={classes.text}></TableCell>
						<TableCell className={classes.text}>
							<b>
								{order_content.reduce(
									(price, item) => price + item.price * item.quantity,
									0
								) + parseFloat(order.del_charge)}
							</b>
						</TableCell>
						<TableCell className={classes.text}></TableCell>
					</TableRow>
				</TableHead>
			</Table>
		</TableContainer>
	);
};

export default OrderContentTable;
