import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Avatar, Button, Typography, Link } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import CustReg from './CustReg';
import RestReg from './RestReg';
import DelReg from './DelReg';

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
	button: {
		width: '20vw',
		height: '3em',
		margin: theme.spacing(2)
	},
	selector: {
		marginBottom: theme.spacing(2)
	},
	wrong: {
		margin: theme.spacing(3)
	}
}));

const SignUp = () => {
	const classes = useStyles();

	const [type, setType] = useState(null);

	const SelectType = () => {
		return (
			<Grid
				container
				direction='column'
				justify='center'
				alignItems='center'
				className={classes.selector}
			>
				<Grid item>
					<Button
						variant='contained'
						color='primary'
						className={classes.button}
						onClick={() => {
							setType('customer');
						}}
					>
						CUSTOMER
					</Button>
				</Grid>
				<Grid item>
					<Button
						variant='contained'
						color='primary'
						className={classes.button}
						onClick={() => {
							setType('restaurant');
						}}
					>
						RESTAURANT
					</Button>
				</Grid>
				<Grid item>
					<Button
						variant='contained'
						color='primary'
						className={classes.button}
						onClick={() => {
							setType('delivery');
						}}
					>
						DELIVERY PERSON
					</Button>
				</Grid>
			</Grid>
		);
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
					Sign Up As{' '}
					{type &&
						`a ${
							type !== 'delivery'
								? type.charAt(0).toUpperCase() + type.slice(1)
								: 'Delivery Person'
						}`}
				</Typography>
			</Grid>
			<Grid item>
				{!type && <SelectType />}
				{type === 'customer' && <CustReg />}
				{type === 'restaurant' && <RestReg />}
				{type === 'delivery' && <DelReg />}
			</Grid>
			<Grid item className={classes.wrong}>
				{type && (
					<Link
						href='#'
						variant='body2'
						onClick={() => {
							setType(null);
						}}
					>
						Wrong Choice?
					</Link>
				)}
			</Grid>
		</Grid>
	);
};

export default SignUp;
