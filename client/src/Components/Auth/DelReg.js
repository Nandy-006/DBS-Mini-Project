import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Button, TextField, Typography } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { setErrorBar } from '../../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
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
		marginTop: theme.spacing(2),
		width: '40vw'
	}
}));

const DelReg = () => {
	const classes = useStyles();

	const [uname, setUname] = useState('');
	const [unameStatus, setUnameStatus] = useState('CHECK');
	const [pass, setPass] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState(false);
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [vno, setVno] = useState('');
	const [vcolour, setVcolour] = useState('');
	const [vmodel, setVmodel] = useState('');
	const [city, setCity] = useState('');

	const history = useHistory();

	const dispatch = useDispatch();

	const submitHandler = async (e) => {
		e.preventDefault();

		if (pass !== confirm) {
			setError(true);
			setPass('');
			setConfirm('');
		} else {
			const address = city;
			const provider = new OpenStreetMapProvider();
			const results = await provider.search({ query: address });
			let lat, long;
			if (results.length) {
				lat = results[0].y;
				long = results[0].x;
			} else {
				lat = 13.006038;
				long = 77.603421;
			}
			const details = {
				type: 'delivery',
				uname,
				pass,
				firstname,
				lastname,
				phone,
				email,
				vno,
				vmodel,
				vcolour,
				lat,
				long
			};
			try {
				await axios.post('http://localhost:5000/signup', details);
				history.push('/signin');
			} catch (err) {
				if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
				else console.log(err);
			}
		}
	};

	const checkUname = async (e) => {
		if (uname !== '') {
			const res = await axios.get('http://localhost:5000/signup', { params: { uname } });
			if (res.data.isTaken) setUnameStatus('TAKEN');
			else setUnameStatus('OK');
		}
	};

	return (
		<form onSubmit={submitHandler}>
			<Grid container className={classes.paper}>
				<Grid item className={classes.formElement}>
					<Typography variant='h6'>User Details</Typography>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item>
						<TextField
							variant='outlined'
							label='Username'
							required
							fullWidth
							style={{ width: '30vw' }}
							onChange={(e) => {
								setUname(e.target.value);
								setUnameStatus('CHECK');
							}}
							error={unameStatus === 'TAKEN'}
						/>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							color='primary'
							style={{ height: '3.5vw', width: '9vw' }}
							startIcon={
								(unameStatus === 'CHECK' && <HelpOutlineOutlinedIcon />) ||
								(unameStatus === 'TAKEN' && <CloseOutlinedIcon />) ||
								(unameStatus === 'OK' && <DoneIcon />)
							}
							disabled={unameStatus === 'OK'}
							onClick={checkUname}
						>
							{unameStatus}
						</Button>
					</Grid>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Password'
							type='password'
							required
							fullWidth
							onChange={(e) => {
								setPass(e.target.value);
							}}
							error={error}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Confirm Password'
							type='password'
							required
							fullWidth
							onChange={(e) => {
								setConfirm(e.target.value);
							}}
							error={error}
						/>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='First Name'
						required
						fullWidth
						onChange={(e) => {
							setFirstname(e.target.value);
						}}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Last Name'
						fullWidth
						onChange={(e) => {
							setLastname(e.target.value);
						}}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Phone'
						type='tel'
						required
						fullWidth
						onChange={(e) => {
							setPhone(e.target.value);
						}}
					/>
				</Grid>
				<Grid item className={classes.formElement}>
					<TextField
						variant='outlined'
						label='Email Address'
						type='email'
						required
						fullWidth
						onChange={(e) => {
							setEmail(e.target.value);
						}}
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
							required
							fullWidth
							onChange={(e) => {
								setVno(e.target.value);
							}}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Vehicle Colour'
							type='tel'
							required
							fullWidth
							onChange={(e) => {
								setVcolour(e.target.value);
							}}
						/>
					</Grid>
				</Grid>
				<Grid container className={classes.formElement} justify='space-between'>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='Vehicle Model'
							required
							fullWidth
							onChange={(e) => {
								setVmodel(e.target.value);
							}}
						/>
					</Grid>
					<Grid item className={classes.adjacent}>
						<TextField
							variant='outlined'
							label='City'
							required
							fullWidth
							onChange={(e) => {
								setCity(e.target.value);
							}}
						/>
					</Grid>
				</Grid>
				<Grid item className={classes.formElement}>
					<Button
						variant='contained'
						type='submit'
						id='submit'
						color='primary'
						className={classes.submit}
					>
						Sign Up
					</Button>
				</Grid>
			</Grid>
		</form>
	);
};

export default DelReg;
