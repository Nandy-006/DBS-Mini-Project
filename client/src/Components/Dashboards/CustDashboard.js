import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RestaurantCard from '../Cards/RestaurantCard';
import ItemCard from '../Cards/ItemCard';
import { emptyCart, setCart } from '../../Redux/cartSlice';
import { setErrorBar, setItems, setRestaurants } from '../../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	item: {
		margin: theme.spacing(2)
	}
}));

const CustDashboard = () => {
	const classes = useStyles();
	const filters = useSelector((state) => state.var.filters);
	const items = useSelector((state) => state.var.items);
	const restaurants = useSelector((state) => state.var.restaurants);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				let res = await axios.get('/restaurants', {
					params: filters
				});
				dispatch(setRestaurants(res.data));
				res = await axios.get('/items', {
					params: filters
				});
				dispatch(setItems(res.data));
				res = await axios.get('/cart');
				if (res.data.length) dispatch(setCart(res.data));
				else dispatch(emptyCart());
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		};
		fetchData();
	}, [filters, dispatch]);

	return (
		<Grid container justify='center'>
			<Grid item className={classes.item} xs={12}>
				<Accordion defaultExpanded>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant='h4'>Restaurants</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2} alignItems='stretch'>
							{restaurants.map((restaurant) => (
								<Grid
									item
									key={restaurant.fssai}
									xs={3}
									style={{ display: 'flex' }}
								>
									<RestaurantCard restaurant={restaurant} />
								</Grid>
							))}
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
			<Grid item className={classes.item} xs={12}>
				<Accordion defaultExpanded>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant='h4'>Items</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2} alignItems='stretch'>
							{items.map((item) => (
								<Grid
									item
									key={`${item.fssai} ${item.itemno}`}
									xs={3}
									style={{ display: 'flex' }}
								>
									<ItemCard item={item} type='customer' />
								</Grid>
							))}
						</Grid>
					</AccordionDetails>
				</Accordion>
			</Grid>
		</Grid>
	);
};

export default CustDashboard;
