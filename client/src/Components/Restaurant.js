import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
	Container,
	Grid,
	Card,
	CardContent,
	Typography,
	makeStyles,
	Tabs,
	Tab
} from '@material-ui/core';
import Image from 'material-ui-image';
import restaurantImage from '../Images/restaurant.jpg';
import ItemCard from '../Components/Cards/ItemCard';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import StarRateIcon from '@material-ui/icons/StarRate';
import RatingCard from './Cards/RatingCard';
import { setErrorBar } from '../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	root: {
		margin: theme.spacing(2)
	},
	address: {
		marginTop: theme.spacing(2)
	},
	name: {
		fontWeight: 'bold'
	},
	flex: {
		display: 'flex'
	},
	grow: {
		flexGrow: 1
	},
	border: {
		borderColor: '#000000',
		borderWidth: 4
	},
	rating: {
		marginTop: theme.spacing(2)
	}
}));

const Restuarant = () => {
	const classes = useStyles();

	const { fssai } = useParams();
	const history = useHistory();

	const dispatch = useDispatch();

	const [restaurant, setRestaurant] = useState(null);
	const [restaurant_phones, setRestaurant_phones] = useState([]);
	const [items, setItems] = useState(null);
	const [ratings, setRatings] = useState([]);
	const [value, setValue] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			try {
				let res = await axios.get(`/restaurants/${fssai}`);
				setRestaurant(res.data.restaurant);
				setRestaurant_phones(res.data.restaurant_phones);
				setItems(res.data.items);
				res = await axios.get(`/ratings/${fssai}`);
				setRatings(res.data);
			} catch (err) {
				history.replace('/');
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		};
		fetchData();
	}, [history, fssai, dispatch]);

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
						<ItemCard item={item} type='customer' />
					</Grid>
				))}
			</Grid>
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
		<Container>
			{restaurant && items && (
				<Grid container direction='column' className={classes.root} spacing={2}>
					<Grid item container spacing={2}>
						<Grid item xs={4} className={classes.flex}>
							<Card
								variant='outlined'
								className={`${classes.grow} ${classes.border}`}
							>
								<CardContent>
									<Typography variant='h5' className={classes.name}>
										{restaurant.rest_name}
									</Typography>
									<Grid container justify='flex-start' alignItems='center'>
										{restaurant_phones.map((phone, i) => (
											<Grid item key={phone.phone}>
												<Typography variant='subtitle1'>
													{phone.phone}
													{i + 1 === restaurant_phones.length ? '' : ', '}
												</Typography>
											</Grid>
										))}
									</Grid>
									<Typography variant='body1' className={classes.address}>
										{restaurant.aline1}
										<br />
										{restaurant.aline2}
										<br />
										{restaurant.city} - {restaurant.pin}
									</Typography>
									<Typography variant='subtitle1' className={classes.address}>
										{restaurant.rating
											? `Average rating: ${parseFloat(
													restaurant.rating
											  ).toFixed(1)} (${restaurant.count})`
											: `Unrated`}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
						<Grid item xs={8}>
							<Image
								src={restaurant.img_link ? restaurant.img_link : restaurantImage}
								aspectRatio={3}
							/>
						</Grid>
					</Grid>
					<Grid item>
						<div className={classes.root}>
							<Tabs
								value={value}
								onChange={(e, newValue) => setValue(newValue)}
								indicatorColor='primary'
								textColor='primary'
								centered
							>
								<Tab icon={<FastfoodIcon />} label='Items' />
								<Tab icon={<StarRateIcon />} label='Reviews' />
							</Tabs>
							{value === 0 && <ItemsTab />}
							{value === 1 && <RatingsTab />}
						</div>
					</Grid>
				</Grid>
			)}
		</Container>
	);
};

export default Restuarant;
