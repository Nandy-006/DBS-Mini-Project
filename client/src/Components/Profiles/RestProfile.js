import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import {
	Grid,
	Button,
	TextField,
	Typography,
	FormControlLabel,
	Checkbox,
	Dialog,
	DialogTitle,
	DialogActions,
	Avatar
} from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import PersonIcon from '@material-ui/icons/Person';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { signout } from '../../Redux/userSlice';
import { setErrorBar, setLoading, setSuccessBar } from '../../Redux/varSlice';
import imageDelete from '../../Firebase/imageDelete';
import imageUpload from '../../Firebase/imageUpload';
import MapDialog from '../Dialogs/MapDialog';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	form: {
		marginTop: theme.spacing(2),
		width: '100vw'
	},
	formElement: {
		marginTop: theme.spacing(2),
		width: '40vw'
	},
	adjacent: {
		width: '19.5vw'
	},
	submit: {
		margin: theme.spacing(2)
	}
}));

const RestProfile = () => {
	const classes = useStyles();
	const dispatch = useDispatch();

	const [uname, setUname] = useState('');
	const [oldpass, setOldpass] = useState('');
	const [pass, setPass] = useState('');
	const [confirm, setConfirm] = useState('');
	const [changepass, setChangepass] = useState(false);
	const [error, setError] = useState(false);
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [fssai, setFssai] = useState('');
	const [rest_name, setRest_name] = useState('');
	const [img_link, setImg_link] = useState('');
	const [image, setImage] = useState('');
	const [aline1, setAline1] = useState('');
	const [aline2, setAline2] = useState('');
	const [city, setCity] = useState('');
	const [pin, setPin] = useState('');
	const [lat, setLat] = useState('');
	const [long, setLong] = useState('');
	const [isVeg, setIsVeg] = useState(false);
	const [phones, setPhones] = useState([]);
	const [newPhone, setNewPhone] = useState('');
	const [edit, setEdit] = useState(false);
	const [open, setOpen] = useState(false);
	const [openMap, setOpenMap] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const res = await axios.get('/profile');
			setUname(res.data.user.uname);
			setFirstname(res.data.user.firstname);
			setLastname(res.data.user.lastname);
			setPhone(res.data.user.phone);
			setEmail(res.data.user.email);
			setFssai(res.data.restaurant.fssai);
			setRest_name(res.data.restaurant.rest_name);
			setImg_link(res.data.restaurant.img_link);
			setAline1(res.data.restaurant.aline1);
			setAline2(res.data.restaurant.aline2);
			setCity(res.data.restaurant.city);
			setPin(res.data.restaurant.pin);
			setLat(res.data.restaurant.lat);
			setLong(res.data.restaurant.long);
			setIsVeg(res.data.restaurant.isveg);
			setPhones(res.data.phones.map((phone) => phone.phone));
		};
		fetchData();
	}, []);

	const history = useHistory();

	const setLocation = (coordinates) => {
		setOpenMap(false);
		if (coordinates) {
			setLat(coordinates.lat);
			setLong(coordinates.long);
		}
	};

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			if (pass !== confirm) {
				setError(true);
				setPass('');
				setConfirm('');
			} else {
				dispatch(setLoading(true));
				if (image) {
					await imageDelete(img_link);
					const url = await imageUpload(image, 'restaurants');
					setImg_link(url);
				}
				const details = {
					user: {
						firstname,
						lastname,
						phone,
						email
					},
					type: {
						rest_name,
						img_link,
						aline1,
						aline2,
						city,
						pin,
						lat,
						long,
						isVeg
					}
				};
				if (changepass) {
					details.changepass = {
						old: oldpass,
						new: pass
					};
				}
				await axios.patch('/profile', details);
				dispatch(setSuccessBar('Profle edited!'));
				dispatch(setLoading(false));
				history.push('/');
			}
		} catch (err) {
			dispatch(setLoading(false));
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	const handleDelete = async () => {
		try {
			setOpen(false);
			const res = await axios.delete('/profile');
			dispatch(signout());
			console.log(res.data.message);
			history.push('/');
		} catch (err) {
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	return (
		<form onSubmit={submitHandler}>
			<Grid container className={classes.paper}>
				<Grid item>
					<Avatar className={classes.avatar}>
						<PersonIcon />
					</Avatar>
				</Grid>
				<Grid item>
					<Typography variant='h4' component='h1'>
						Profile
					</Typography>
				</Grid>
				<Grid item className={classes.formElement}>
					<Typography variant='h6'>User Details</Typography>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Username'
						value={uname}
						required
						fullWidth
						disabled
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<Typography variant='h6'>Manager Details</Typography>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Username'
						value={uname}
						required
						fullWidth
						disabled
					/>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item>
						<TextField
							variant='outlined'
							label='Old Password'
							type='password'
							value={oldpass}
							required
							fullWidth
							style={{ width: '25vw' }}
							onChange={(e) => {
								setOldpass(e.target.value);
							}}
							disabled={!changepass}
						/>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='primary'
							style={{ height: '3.5vw', width: '14vw' }}
							onClick={() => {
								setChangepass(true);
							}}
							disabled={changepass}
						>
							Change Password?
						</Button>
					</Grid>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='New Password'
							type='password'
							value={pass}
							required
							fullWidth
							onChange={(e) => {
								setPass(e.target.value);
							}}
							disabled={!changepass}
							error={error}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Confirm new Password'
							type='password'
							value={confirm}
							required
							fullWidth
							onChange={(e) => {
								setConfirm(e.target.value);
							}}
							disabled={!changepass}
							error={error}
						/>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='First Name'
						value={firstname}
						required
						fullWidth
						onChange={(e) => {
							setFirstname(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Last Name'
						value={lastname}
						fullWidth
						onChange={(e) => {
							setLastname(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Phone'
						type='tel'
						value={phone}
						required
						fullWidth
						onChange={(e) => {
							setPhone(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Email Address'
						type='email'
						value={email}
						required
						fullWidth
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<Typography variant='h6'>Restaurant Details</Typography>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item>
						<Grid item>
							<TextField
								variant='outlined'
								label='FSSAI Number'
								type='tel'
								value={fssai}
								style={{ width: '30vw' }}
								required
								fullWidth
								onChange={(e) => {
									setFssai(e.target.value);
								}}
								disabled
							/>
						</Grid>
					</Grid>
					<Grid item>
						<FormControlLabel
							control={
								<Checkbox
									checked={isVeg}
									onChange={(e) => setIsVeg(e.target.checked)}
									disabled={!edit}
								/>
							}
							label='Pure Veg?'
						/>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Restaurant Name'
						value={rest_name}
						required
						fullWidth
						onChange={(e) => {
							setRest_name(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<Button
						variant='contained'
						component='label'
						color='primary'
						disabled={Boolean(image) || !edit}
						fullWidth
					>
						{image ? `Uploaded: ${image.name}` : 'Change Restaurant Image'}
						<input
							type='file'
							accept='image/*'
							hidden
							onChange={(e) => {
								if (e.target.files[0]) setImage(e.target.files[0]);
							}}
						/>
					</Button>
				</Grid>
				<Grid item className={classes.formElement}>
					<Typography variant='h6' style={{ fontWeight: 'bold' }}>
						Restaurant contact numbers
					</Typography>
				</Grid>
				{phones.map((p, i) => (
					<Grid container key={p} className={classes.formElement} justify='space-between'>
						<Grid item>
							<Typography variant='h6' style={{ width: '30vw' }}>
								{p}
							</Typography>
						</Grid>
						<Grid item>
							<Button
								variant='contained'
								color='primary'
								style={{ height: '3.5vw', width: '9vw' }}
								startIcon={<DeleteIcon />}
								onClick={async () => {
									await axios.delete(`/profile/${p}`);
									const removed = phones.filter((ph, idx) => idx !== i);
									setPhones(removed);
								}}
								disabled={!edit}
							>
								DELETE
							</Button>
						</Grid>
					</Grid>
				))}
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item>
						<TextField
							variant='outlined'
							label='Phone'
							value={newPhone}
							type='tel'
							fullWidth
							style={{ width: '30vw' }}
							onChange={(e) => {
								setNewPhone(e.target.value);
							}}
							disabled={!edit}
						/>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='primary'
							style={{ height: '3.5vw', width: '9vw' }}
							startIcon={<AddIcon />}
							onClick={async () => {
								await axios.post(`/profile/${newPhone}`);
								setPhones(phones.concat([newPhone]));
								setNewPhone('');
							}}
							disabled={!edit}
						>
							ADD
						</Button>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<Typography variant='h6'>Address</Typography>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Address Line 1'
						value={aline1}
						required
						fullWidth
						onChange={(e) => {
							setAline1(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Address Line 2'
						value={aline2}
						fullWidth
						onChange={(e) => {
							setAline2(e.target.value);
						}}
						disabled={!edit}
					/>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='City'
							value={city}
							required
							fullWidth
							onChange={(e) => {
								setCity(e.target.value);
							}}
							disabled={!edit}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Pin Code'
							type='tel'
							value={pin}
							required
							fullWidth
							onChange={(e) => {
								setPin(e.target.value);
							}}
							disabled={!edit}
						/>
					</Grid>
				</Grid>
				<Grid
					container
					className={classes.formElement}
					justify='space-between'
					alignItems='center'
				>
					<Grid item>
						<TextField
							variant='outlined'
							label='Latitude'
							value={lat}
							required
							fullWidth
							onChange={(e) => {
								setLat(e.target.value);
							}}
							disabled
						/>
					</Grid>
					<Grid item>
						<TextField
							variant='outlined'
							label='Longitude'
							value={long}
							required
							fullWidth
							onChange={(e) => {
								setLong(e.target.value);
							}}
							disabled
						/>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='primary'
							startIcon={<LocationOnIcon />}
							onClick={() => setOpenMap(true)}
							disabled={!edit}
						>
							Change location
						</Button>
					</Grid>
					<MapDialog open={openMap} setOpen={setOpenMap} handleComplete={setLocation} />
				</Grid>
				<Grid
					container
					className={classes.formElement}
					style={{ marginRight: '20px' }}
					spacing={2}
				>
					<Grid item xs={4}>
						<Button
							variant='contained'
							color='primary'
							className={classes.submit}
							fullWidth
							startIcon={<EditIcon />}
							disabled={edit}
							onClick={() => {
								setEdit(true);
							}}
						>
							Edit
						</Button>
					</Grid>
					<Grid item xs={4}>
						<Button
							variant='contained'
							type='submit'
							color='primary'
							className={classes.submit}
							fullWidth
							startIcon={<SaveIcon />}
							disabled={!edit && !changepass}
						>
							Save
						</Button>
					</Grid>
					<Grid item xs={4}>
						<Button
							variant='contained'
							color='primary'
							className={classes.submit}
							fullWidth
							startIcon={<CloseOutlinedIcon />}
							onClick={() => {
								history.push('/');
							}}
						>
							Cancel
						</Button>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement} style={{ marginLeft: '10px' }}>
					<Button
						variant='contained'
						color='secondary'
						className={classes.submit}
						style={{ width: '36vw' }}
						startIcon={<DeleteIcon />}
						onClick={() => setOpen(true)}
					>
						Delete Profile
					</Button>
					<Dialog open={open} onClose={() => setOpen(false)}>
						<DialogTitle>Are you sure you want to delete your profile?</DialogTitle>
						<DialogActions>
							<Button color='primary' variant='contained' onClick={handleDelete}>
								Yes, Delete
							</Button>
							<Button
								color='primary'
								variant='contained'
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
						</DialogActions>
					</Dialog>
				</Grid>
			</Grid>
		</form>
	);
};

export default RestProfile;
