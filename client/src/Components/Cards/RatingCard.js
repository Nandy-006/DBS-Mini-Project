import React from 'react';
import { Avatar, Card, CardContent, CardHeader, makeStyles, Typography } from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
	root: {
		marginInline: theme.spacing(30),
		marginBlock: theme.spacing(4),
		borderColor: '#000000',
		borderWidth: '1px'
	},
	rating: {
		margin: theme.spacing(2)
	}
}));

const RatingCard = ({ rating }) => {
	const classes = useStyles();

	return (
		<Card className={classes.root} variant='outlined'>
			<CardHeader
				title={rating.cust_uname}
				subheader={moment(rating.reviewtime).format('D MMM YYYY h:mm A')}
				avatar={<Avatar>{rating.cust_uname.charAt(0)}</Avatar>}
				action={
					<Rating
						value={rating.rating}
						size='large'
						className={classes.rating}
						readOnly
					/>
				}
				titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
			/>
			<CardContent>
				<Typography variant='subtitle1'>
					{rating.review ? rating.review : 'No review'}
				</Typography>
			</CardContent>
		</Card>
	);
};

export default RatingCard;
