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
	Dialog,
	DialogTitle,
	DialogActions,
	Avatar
} from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonIcon from '@material-ui/icons/Person';
import { signout } from '../../Redux/userSlice';

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

const DelProfile = () => {
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
	const [vno, setVno] = useState('');
	const [vcolour, setVcolour] = useState('');
	const [vmodel, setVmodel] = useState('');
	const [edit, setEdit] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const res = await axios.get('/profile');
			setUname(res.data.user.uname);
			setFirstname(res.data.user.firstname);
			setLastname(res.data.user.lastname);
			setPhone(res.data.user.phone);
			setEmail(res.data.user.email);
			setVno(res.data.delivery.vno);
			setVcolour(res.data.delivery.vcolour);
			setVmodel(res.data.delivery.vmodel);
		};
		fetchData();
	}, []);

	const history = useHistory();

	const submitHandler = async (e) => {
		e.preventDefault();
		try {
			if (changepass && pass !== confirm) {
				setError(true);
				setPass('');
				setConfirm('');
			} else {
				const details = {
					user: {
						firstname,
						lastname,
						phone,
						email
					},
					type: {
						vno,
						vmodel,
						vcolour
					}
				};
				if (changepass) {
					details.changepass = {
						old: oldpass,
						new: pass
					};
				}
				const res = await axios.patch('/profile', details);
				if (res.status === 200) {
					history.push('/');
				} else console.log(res.data.message);
			}
		} catch (err) {
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
					<Typography variant='h6'>Vehicle Details</Typography>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Vehicle Number'
							value={vno}
							required
							fullWidth
							onChange={(e) => {
								setVno(e.target.value);
							}}
							disabled={!edit}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Vehicle Colour'
							type='tel'
							value={vcolour}
							required
							fullWidth
							onChange={(e) => {
								setVcolour(e.target.value);
							}}
							disabled={!edit}
						/>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Vehicle Model'
						value={vmodel}
						required
						fullWidth
						onChange={(e) => {
							setVmodel(e.target.value);
						}}
						disabled={!edit}
					/>
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

export default DelProfile;
