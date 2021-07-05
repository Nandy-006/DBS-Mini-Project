import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Tabs,
	Tab,
	Badge,
	Grid,
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	IconButton,
	Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import moment from 'moment';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import StarRateIcon from '@material-ui/icons/StarRate';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DoneIcon from '@material-ui/icons/Done';
import ItemCard from '../Cards/ItemCard';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import RatingCard from '../Cards/RatingCard';
import { setItems, setErrorBar } from '../../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(1)
	},
	grow: { flexGrow: 1 },
	rating: {
		marginTop: theme.spacing(2)
	}
}));

const RestDashboard = () => {
	const classes = useStyles();

	const [value, setValue] = useState(0);
	const [pending, setPending] = useState([]);
	const [ratings, setRatings] = useState([]);

	const filters = useSelector((state) => state.var.filters);
	const items = useSelector((state) => state.var.items);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				let res = await axios.get('/items', { params: filters });
				dispatch(setItems(res.data));
				const orders = await axios.get('/orders', { params: { pending: true } });
				console.log(orders.data.orders);
				setPending(orders.data.orders);
				res = await axios.get(`/ratings/1`);
				setRatings(res.data);
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		};
		fetchData();
	}, [filters, dispatch]);

	const handlePrepared = async (order) => {
		try {
			await axios.patch(`/orders/${order.orderno}`, { isprepared: true });
		} catch (err) {
			if (err.response) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const handleDispatched = async (order) => {
		try {
			await axios.patch(`/orders/${order.orderno}`, { isreceived: true });
			setPending(pending.filter((o) => o.orderno !== order.orderno));
		} catch (err) {
			if (err.response) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const ItemsTab = () => {
		return (
			<Grid container spacing={2} alignItems='stretch'>
				{items.map((item) => (
					<Grid
						item
						key={`${item.fssai} ${item.itemno}`}
						xs={3}
						style={{ display: 'flex' }}
					>
						<ItemCard item={item} type='restaurant' />
					</Grid>
				))}
			</Grid>
		);
	};

	const Order = ({ order }) => {
		const [prepared, setPrepared] = useState(order.isprepared);

		return (
			<Accordion
				key={order.orderno}
				style={{ backgroundColor: prepared ? '#defffe' : 'inherit' }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant='h6' className={classes.grow}>
						Order <b>#{order.orderno}</b> placed by <b>{order.customer}</b> at{' '}
						{moment(order.ordertime).format('h:mm A')}
					</Typography>
					<Tooltip title='Prepared'>
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								handlePrepared(order);
								setPrepared(true);
							}}
							disabled={prepared}
						>
							<DoneIcon fontSize='large' />
						</IconButton>
					</Tooltip>
					<Tooltip title='Dispatched'>
						<IconButton
							onClick={(e) => {
								e.stopPropagation();
								handleDispatched(order);
							}}
						>
							<DoneAllIcon fontSize='large' />
						</IconButton>
					</Tooltip>
				</AccordionSummary>
				<AccordionDetails>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>
										<b>Item number</b>
									</TableCell>
									<TableCell>
										<b>Item name</b>
									</TableCell>
									<TableCell>
										<b>Quantity</b>
									</TableCell>
									<TableCell>
										<b>Total Price</b>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{order.contents.map((item) => {
									return (
										<TableRow key={item.itemno}>
											<TableCell>{item.itemno}</TableCell>
											<TableCell>{item.itemname}</TableCell>
											<TableCell>{item.quantity}</TableCell>
											<TableCell>{item.price}</TableCell>
										</TableRow>
									);
								})}
								<TableRow>
									<TableCell colSpan={2}>
										<b>Grand Total</b>
									</TableCell>
									<TableCell>
										<b>
											{order.contents.reduce(
												(a, b) => a + parseFloat(b.quantity),
												0
											)}
										</b>
									</TableCell>
									<TableCell>
										<b>
											{order.contents.reduce(
												(a, b) => a + parseFloat(b.price),
												0
											)}
										</b>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</AccordionDetails>
			</Accordion>
		);
	};

	const PendingTab = () => {
		return (
			<div>
				{pending.map((order) => (
					<Order order={order} />
				))}
			</div>
		);
	};

	const RatingsTab = () => {
		return (
			<div>
				{!ratings.length && (
					<Typography variant='h4' className={classes.rating}>
						No Reviews Available
					</Typography>
				)}
				{ratings.length !== 0 &&
					ratings.map((rating) => (
						<RatingCard rating={rating} className={classes.rating} />
					))}
			</div>
		);
	};

	return (
		<div className={classes.root}>
			<Tabs
				value={value}
				onChange={(e, newValue) => setValue(newValue)}
				indicatorColor='primary'
				textColor='primary'
				centered
			>
				<Tab icon={<FastfoodIcon />} label='Items' />
				<Tab
					icon={
						<Badge badgeContent={pending.length} color='secondary'>
							<AssignmentTurnedInIcon />
						</Badge>
					}
					label='Pending'
				/>
				<Tab icon={<StarRateIcon />} label='Reviews' />
			</Tabs>
			{value === 0 && <ItemsTab />}
			{value === 1 && <PendingTab />}
			{value === 2 && <RatingsTab />}
		</div>
	);
};

export default RestDashboard;
