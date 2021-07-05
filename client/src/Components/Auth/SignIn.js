import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Avatar, Button, Link, TextField, Typography } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { signin } from '../../Redux/userSlice';
import { setErrorBar } from '../../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(4),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	form: {
		marginTop: theme.spacing(4),
		width: '100vw'
	},
	formElement: {
		marginTop: theme.spacing(2),
		width: '20vw'
	},
	submit: {
		width: '20vw'
	},
	link: {
		marginTop: theme.spacing(2)
	}
}));

const SignIn = () => {
	const classes = useStyles();

	const socket = useSelector((state) => state.socket.socket);

	const [uname, setUname] = useState('');
	const [pass, setPass] = useState('');
	const [error, setError] = useState(false);
	const dispatch = useDispatch();
	const history = useHistory();

	const submitHandler = async (e) => {
		e.preventDefault();
		let res;
		try {
			const credentials = { uname, pass };
			res = await axios.post('/signin', credentials);
			dispatch(signin(res.data));
			socket.emit('signin', uname);
			history.push('/dashboard');
		} catch (err) {
			console.log(err.response);
			if (err.response.status === 401) setError(true);
			if (err.response.data.message) dispatch(setErrorBar(err.response.data.message));
			else console.log(err);
		}
	};

	return (
		<Grid container className={classes.paper}>
			<Grid item>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
			</Grid>
			<Grid item>
				<Typography variant='h5' component='h1'>
					Sign In
				</Typography>
			</Grid>
			<Grid item>
				<form className={classes.form} onSubmit={submitHandler}>
					<Grid container direction='column' alignItems='center'>
						<Grid item className={classes.formElement}>
							<TextField
								variant='outlined'
								label='Username'
								required
								fullWidth
								onChange={(e) => {
									setUname(e.target.value);
									setError(false);
								}}
								error={error}
							/>
						</Grid>
						<Grid item className={classes.formElement}>
							<TextField
								variant='outlined'
								label='Password'
								type='password'
								required
								fullWidth
								onChange={(e) => {
									setPass(e.target.value);
									setError(false);
								}}
								error={error}
							/>
						</Grid>
						<Grid item className={classes.formElement}>
							<Button
								variant='contained'
								type='submit'
								id='submit'
								color='primary'
								className={classes.submit}
							>
								Sign In
							</Button>
						</Grid>
					</Grid>
				</form>
			</Grid>
			<Grid item className={classes.link}>
				<Link href='/signup' variant='body2'>
					Don't have an account yet? Sign Up
				</Link>
			</Grid>
		</Grid>
	);
};

export default SignIn;
