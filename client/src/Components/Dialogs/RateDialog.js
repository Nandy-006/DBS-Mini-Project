import React, { useState } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	TextField,
	Typography,
	Button
} from '@material-ui/core';
import Rating from '@material-ui/lab/Rating';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

const RateDialog = ({ open, onClose, handleRate }) => {
	const [rating, setRating] = useState(0);
	const [review, setReview] = useState('');

	return (
		<Dialog
			open={open}
			onClose={() => {
				setRating(0);
				onClose();
			}}
			fullWidth
			maxWidth='sm'
		>
			<DialogTitle>
				<Typography variant='h6'>Rate this restaurant</Typography>
			</DialogTitle>
			<DialogContent style={{ overflow: 'hidden' }}>
				<Grid container direction='column' spacing={2}>
					<Grid item xs={12}>
						<FormControlLabel
							control={
								<Rating
									value={rating}
									onChange={(e, val) => setRating(val)}
									style={{ padding: '10px' }}
								/>
							}
							label='Rating'
							labelPlacement='start'
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							variant='outlined'
							label='Review'
							onChange={(e) => setReview(e.target.value)}
							multiline
							rows={4}
							fullWidth
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					startIcon={<CloseIcon />}
					onClick={() => {
						setRating(0);
						onClose();
					}}
					color='primary'
				>
					Cancel
				</Button>
				<Button
					variant='contained'
					startIcon={<DoneIcon />}
					onClick={() => {
						handleRate({ rating, review });
						setRating(0);
						onClose();
					}}
					disabled={rating === 0}
					color='primary'
				>
					Rate!
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RateDialog;
