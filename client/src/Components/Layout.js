import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, matchPath } from 'react-router';
import axios from 'axios';
import {
	makeStyles,
	fade,
	AppBar,
	Link,
	Toolbar,
	Typography,
	InputBase,
	IconButton,
	Badge,
	Tooltip,
	Menu,
	MenuItem,
	FormControlLabel,
	Switch,
	Button,
	CircularProgress,
	Snackbar
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import SearchIcon from '@material-ui/icons/Search';
import HistoryIcon from '@material-ui/icons/History';
import AccountCircle from '@material-ui/icons/AccountCircle';
import FilterListIcon from '@material-ui/icons/FilterList';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import StarIcon from '@material-ui/icons/Star';
import { signout } from '../Redux/userSlice';
import {
	changeDelAvail,
	setFilters,
	setItems,
	setLoading,
	setErrorBar,
	setSuccessBar,
	setInfoBar
} from '../Redux/varSlice';
import FilterDialog from '../Components/Dialogs/FilterDialog';
import CreateItemDialog from '../Components/Dialogs/CreateItemDialog';
import RateDialog from '../Components/Dialogs/RateDialog';
import imageUpload from '../Firebase/imageUpload';
import MapDialog from './Dialogs/MapDialog';

const useStyles = makeStyles((theme) => {
	return {
		toolbarspace: theme.mixins.toolbar,
		icon: {
			margin: theme.spacing(2)
		},
		grow: {
			flexGrow: 1
		},
		link: {
			color: 'inherit',
			'&:hover': {
				textDecoration: 'none'
			}
		},
		search: {
			position: 'relative',
			borderRadius: theme.shape.borderRadius,
			backgroundColor: fade(theme.palette.common.white, 0.15),
			'&:hover': {
				backgroundColor: fade(theme.palette.common.white, 0.25)
			},
			marginRight: theme.spacing(2),
			width: '100%',
			[theme.breakpoints.up('sm')]: {
				marginLeft: theme.spacing(6),
				width: 'auto'
			}
		},
		searchIcon: {
			padding: theme.spacing(0, 2),
			height: '100%',
			position: 'absolute',
			pointerEvents: 'none',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},
		inputRoot: {
			color: 'inherit'
		},
		inputInput: {
			padding: theme.spacing(1, 1, 1, 0),
			// vertical padding + font size from searchIcon
			paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
			transition: theme.transitions.create('width'),
			width: '100%',
			[theme.breakpoints.up('md')]: {
				width: '40ch'
			}
		},
		uname: {
			marginInline: theme.spacing(2)
		},
		history: {
			color: 'inherit',
			marginRight: theme.spacing(2)
		}
	};
});

const Layout = ({ children }) => {
	const classes = useStyles();
	const user = useSelector((state) => state.user);
	const cart = useSelector((state) => state.cart.cart);
	const delAvail = useSelector((state) => state.var.delAvail);
	const filters = useSelector((state) => state.var.filters);
	const loading = useSelector((state) => state.var.loading);
	const errorBar = useSelector((state) => state.var.errorBar);
	const errorMessage = useSelector((state) => state.var.errorMessage);
	const successBar = useSelector((state) => state.var.successBar);
	const successMessage = useSelector((state) => state.var.successMessage);
	const infoBar = useSelector((state) => state.var.infoBar);
	const infoMessage = useSelector((state) => state.var.infoMessage);
	const orderAvail = useSelector((state) => state.socket.orderAvail);

	const [anchorEl, setAnchorEl] = useState(null);
	const [openFilters, setOpenFilters] = useState(false);
	const [openCreateItem, setOpenCreateItem] = useState(false);
	const [openRate, setOpenRate] = useState(false);
	const [openMap, setOpenMap] = useState(false);
	const [search, setSearch] = useState('');

	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();

	const handleOpen = (e) => setAnchorEl(e.currentTarget);
	const handleClose = () => setAnchorEl(null);
	const handleProfile = () => {
		history.push('/profile');
		setAnchorEl(null);
	};
	const handleSignout = async () => {
		try {
			await axios.post('/signout');
			if (user.type === 'delivery') dispatch(changeDelAvail(false));
			dispatch(signout());
			history.push('/signin');
			console.log('Signed Out!');
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		} finally {
			setAnchorEl(null);
		}
	};
	const handleCreateItem = async (item) => {
		try {
			setOpenCreateItem(false);
			dispatch(setLoading(true));
			if (item.image) {
				item.img_link = await imageUpload(item.image, 'items');
				console.log(item.img_link);
			} else {
				item.img_link = '';
			}
			delete item.image;
			await axios.post('/items', item);
			const res = await axios.get('/items', { params: filters });
			dispatch(setItems(res.data));
			dispatch(setLoading(false));
			dispatch(setSuccessBar('Item added!'));
		} catch (err) {
			dispatch(setLoading(false));
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};
	const handleRate = async (rating) => {
		const fssai = matchPath(location.pathname, '/restaurants/:fssai').params.fssai;
		try {
			await axios.post(`/ratings/${fssai}`, rating);
			console.log('Rated!');
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};
	const handleDelAvail = async (coordinates) => {
		setOpenMap(false);
		if (coordinates === 'Unavail') {
			try {
				await axios.patch('/profile', { type: { isavail: false } });
				dispatch(changeDelAvail(false));
			} catch (err) {
				if (err.response && err.response.data.message)
					dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		} else if (coordinates) {
			try {
				console.log('Setting true');
				coordinates.isavail = true;
				await axios.patch('/profile', { type: coordinates });
				dispatch(changeDelAvail(true));
			} catch (err) {
				if (err.response && err.response.data.message)
					dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		} else dispatch(setInfoBar('Enter location to wait for orders'));
	};

	return (
		<div>
			<AppBar>
				<Toolbar>
					<FastfoodIcon className={classes.icon} fontSize='large' />
					<Typography variant='h3'>
						<Link href='/' className={classes.link}>
							FooDery
						</Link>
					</Typography>
					{user.uname && user.type !== 'delivery' && location.pathname === '/dashboard' && (
						<>
							<div className={classes.search}>
								<div className={classes.searchIcon}>
									<SearchIcon />
								</div>
								<InputBase
									placeholder='Type and press enter'
									classes={{
										root: classes.inputRoot,
										input: classes.inputInput
									}}
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter')
											dispatch(setFilters({ ...filters, name: search }));
									}}
								/>
							</div>
							<Button
								variant='contained'
								color='primary'
								startIcon={<FilterListIcon />}
								onClick={() => setOpenFilters(true)}
							>
								Filters
							</Button>
							<FilterDialog
								onClose={() => setOpenFilters(false)}
								open={openFilters}
							/>
						</>
					)}
					<div className={classes.grow}></div>
					{loading && <CircularProgress color='secondary' />}
					{user.type === 'customer' &&
						matchPath(location.pathname, { path: '/restaurants/:fssai' }) && (
							<>
								<Tooltip title='Rate this restaurant'>
									<IconButton
										color='inherit'
										onClick={() => {
											setOpenRate(true);
										}}
									>
										<StarIcon />
									</IconButton>
								</Tooltip>
								<RateDialog
									open={openRate}
									onClose={() => setOpenRate(false)}
									handleRate={handleRate}
								/>
							</>
						)}
					{user.type === 'customer' && (
						<Tooltip title='Cart'>
							<IconButton
								color='inherit'
								onClick={() => {
									if (location.pathname !== '/cart') history.push('/cart');
								}}
							>
								<Badge badgeContent={cart.length} color='secondary'>
									<ShoppingCartIcon />
								</Badge>
							</IconButton>
						</Tooltip>
					)}
					{user.type === 'restaurant' && (
						<>
							<Tooltip title='New Item'>
								<IconButton
									color='inherit'
									onClick={() => {
										setOpenCreateItem(true);
									}}
								>
									<AddCircleOutlineIcon />
								</IconButton>
							</Tooltip>
							<CreateItemDialog
								open={openCreateItem}
								onClose={() => setOpenCreateItem(false)}
								handleSave={handleCreateItem}
							/>
						</>
					)}
					{user.type === 'delivery' && (
						<>
							<FormControlLabel
								control={
									<Switch
										checked={delAvail}
										onChange={(e) => {
											if (e.target.checked) setOpenMap(true);
											else handleDelAvail('Unavail');
										}}
									/>
								}
								label='Taking Orders?'
								disabled={orderAvail}
							/>
							<MapDialog
								open={openMap}
								setOpen={setOpenMap}
								handleComplete={handleDelAvail}
							/>
						</>
					)}
					{user.uname && (
						<Typography variant='h6' className={classes.uname}>
							{user.uname}
						</Typography>
					)}
					{user.uname && (
						<Tooltip title='Order History'>
							<IconButton
								className={classes.history}
								onClick={() => history.push('/orders')}
							>
								<HistoryIcon fontSize='inherit' />
							</IconButton>
						</Tooltip>
					)}
					{user.uname && (
						<div>
							<IconButton color='inherit' onClick={handleOpen}>
								<AccountCircle />
							</IconButton>
							<Menu
								anchorEl={anchorEl}
								keepMounted
								getContentAnchorEl={null}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'center'
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'center'
								}}
								open={Boolean(anchorEl)}
								onClose={handleClose}
							>
								<MenuItem onClick={handleProfile}>Profile</MenuItem>
								<MenuItem onClick={handleSignout}>Sign Out</MenuItem>
							</Menu>
						</div>
					)}
				</Toolbar>
			</AppBar>
			<div>
				<div className={classes.toolbarspace} />
				{children}
			</div>
			<Snackbar
				open={errorBar}
				autoHideDuration={4000}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				onClose={() => dispatch(setErrorBar(''))}
			>
				<MuiAlert
					elevation={6}
					variant='filled'
					onClose={() => dispatch(setErrorBar(''))}
					severity='error'
				>
					{errorMessage}
				</MuiAlert>
			</Snackbar>
			<Snackbar
				open={successBar}
				autoHideDuration={4000}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				onClose={() => dispatch(setSuccessBar(''))}
			>
				<MuiAlert
					elevation={6}
					variant='filled'
					onClose={() => dispatch(setSuccessBar(''))}
					severity='success'
				>
					{successMessage}
				</MuiAlert>
			</Snackbar>
			<Snackbar
				open={infoBar}
				autoHideDuration={4000}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				onClose={() => dispatch(setInfoBar(''))}
			>
				<MuiAlert
					elevation={6}
					variant='filled'
					onClose={() => dispatch(setInfoBar(''))}
					severity='info'
				>
					{infoMessage}
				</MuiAlert>
			</Snackbar>
		</div>
	);
};

export default Layout;
