import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	Chip,
	FormControlLabel,
	Grid,
	Switch,
	Typography,
	Dialog,
	DialogTitle,
	DialogActions
} from '@material-ui/core';
import Image from 'material-ui-image';
import AddIcon from '@material-ui/icons/Add';
import ItemImage from '../../Images/foodItem.jpg';
import { setCart, emptyCart } from '../../Redux/cartSlice';
import { setItems, setLoading, setErrorBar, setSuccessBar } from '../../Redux/varSlice';
import EditItemDialog from '../Dialogs/EditItemDialog';
import imageUpload from '../../Firebase/imageUpload';
import imageDelete from '../../Firebase/imageDelete';

const useStyles = makeStyles((theme) => ({
	root: {
		border: true,
		borderWidth: '3px',
		borderRadius: 8,
		margin: theme.spacing(2),
		flexGrow: 1
	},
	media: {
		height: 0,
		paddingTop: '56.25%' // 16:9
	},
	cardAction: {
		width: '100%',
		justifyContent: 'space-between'
	},
	action: {
		marginRight: theme.spacing(2)
	},
	chip: {
		marginInline: theme.spacing(1)
	}
}));

const ItemCard = ({ item, type }) => {
	const classes = useStyles();
	const [avail, setAvail] = useState(item.isavail);
	const [openEdit, setOpenEdit] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	const user = useSelector((state) => state.user);
	const dispatch = useDispatch();

	const clickHandler = () => {
		if (user.type === 'restaurant') setOpenEdit(true);
	};

	const switchHandler = async (e) => {
		try {
			setAvail(e.target.checked);
			await axios.patch(`/items/${item.itemno}`, { isavail: e.target.checked });
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const handleAddItem = async () => {
		try {
			await axios.post(`/cart/${item.itemno}`, { fssai: item.fssai });
			const res = await axios.get('/cart');
			if (res.data.length) dispatch(setCart(res.data));
			else dispatch(emptyCart());
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const handleEdit = async (response) => {
		setOpenEdit(false);
		if (response === 'CANCEL') {
			//pass
		} else if (response === 'DELETE') {
			setOpenDelete(true);
		} else {
			try {
				dispatch(setLoading(true));
				if (response.image) {
					await imageDelete(item.img_link);
					response.img_link = await imageUpload(response.image, 'items');
				} else {
					response.img_link = item.img_link;
				}
				delete response.image;
				await axios.patch(`items/${item.itemno}`, response);
				const res = await axios.get('/items');
				dispatch(setItems(res.data));
				dispatch(setLoading(false));
				dispatch(setSuccessBar('Item Edited!'));
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		}
	};

	const handleDelete = async () => {
		try {
			setOpenDelete(false);
			dispatch(setLoading(true));
			await axios.delete(`items/${item.itemno}`);
			await imageDelete(item.img_link);
			const res = await axios.get('/items');
			dispatch(setItems(res.data));
			dispatch(setLoading(false));
			dispatch(setSuccessBar('Item Deleted!'));
		} catch (err) {
			dispatch(setLoading(false));
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	return (
		<Card
			variant='outlined'
			className={classes.root}
			style={{
				backgroundColor: type === 'customer' || avail ? 'inherit' : '#d3d3d3',
				borderColor: item.isveg ? '#26d43a' : '#c41f1f'
			}}
		>
			<EditItemDialog open={openEdit} onClose={handleEdit} item={item} />
			<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
				<DialogTitle>Are you sure you want to delete {item.itemname}</DialogTitle>
				<DialogActions>
					<Button color='primary' variant='contained' onClick={handleDelete}>
						Yes, Delete
					</Button>
					<Button
						color='primary'
						variant='contained'
						onClick={() => setOpenDelete(false)}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
			<CardActionArea onClick={user.type === 'restaurant' ? clickHandler : null}>
				<CardHeader title={item.itemname} titleTypographyProps={{ variant: 'h6' }} />
				<CardMedia>
					<Image src={item.img_link ? item.img_link : ItemImage} aspectRatio={3} />
				</CardMedia>
				<CardContent>
					<Grid container alignItems='center' spacing={2}>
						<Grid item xs={12}>
							<Typography variant='subtitle1'>{item.rest_name}</Typography>
							<Typography variant='subtitle2'>
								{item.itemdesc ? item.itemdesc : 'No description available'}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Chip label={item.cuisine} color='secondary' className={classes.chip} />
							<Chip label={item.mealtype} color='primary' className={classes.chip} />
						</Grid>
					</Grid>
				</CardContent>
			</CardActionArea>
			<CardActions className={classes.cardAction}>
				<Typography variant='h5' style={{ fontWeight: 'bold' }}>
					&#8377; {item.price}
				</Typography>
				{type === 'customer' && (
					<Button
						variant='contained'
						color='primary'
						startIcon={<AddIcon />}
						className={classes.action}
						onClick={handleAddItem}
					>
						Add to Cart
					</Button>
				)}
				{type === 'restaurant' && (
					<FormControlLabel
						control={
							<Switch checked={avail} onChange={switchHandler} color='primary' />
						}
						label='Availability'
						className={classes.action}
					/>
				)}
			</CardActions>
		</Card>
	);
};

export default ItemCard;
