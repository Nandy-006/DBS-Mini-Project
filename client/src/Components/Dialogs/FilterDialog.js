import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Switch,
	Grid,
	makeStyles,
	Typography,
	DialogActions,
	Button
} from '@material-ui/core';
import { cuisineData, mealTypeData } from '../../data';
import { setFilters } from '../../Redux/varSlice';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
		'& > *': {
			margin: theme.spacing(0.5)
		}
	}
}));

const FilterDialog = ({ open, onClose }) => {
	const classes = useStyles();
	const filters = useSelector((state) => state.var.filters);
	const dispatch = useDispatch();
	const [dialogFilters, setDialogFilters] = useState(filters);

	return (
		<Dialog onClose={onClose} open={open}>
			<DialogTitle>Choose Filters</DialogTitle>
			<DialogContent>
				<Grid container justify='center' alignItems='center' spacing={2}>
					<Grid item xs={12}>
						<FormControlLabel
							control={
								<Switch
									color='primary'
									checked={dialogFilters.veg}
									onChange={(e) =>
										setDialogFilters({
											...dialogFilters,
											veg: e.target.checked
										})
									}
								/>
							}
							label='Vegetarian?'
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant='h6'>Cuisines</Typography>
					</Grid>
					<Grid item xs={12} className={classes.root}>
						{cuisineData.map((cuisine) => (
							<FormControlLabel
								key={cuisine}
								control={
									<Switch
										color='primary'
										checked={dialogFilters.cuisines.includes(cuisine)}
										onChange={(e) => {
											if (e.target.checked)
												setDialogFilters({
													...dialogFilters,
													cuisines: dialogFilters.cuisines.concat(cuisine)
												});
											else
												setDialogFilters({
													...dialogFilters,
													cuisines: dialogFilters.cuisines.filter(
														(cuis) => cuis !== cuisine
													)
												});
										}}
									/>
								}
								label={cuisine}
							/>
						))}
					</Grid>
					<Grid item xs={12}>
						<Typography variant='h6'>Meal Types</Typography>
					</Grid>
					<Grid item xs={12} className={classes.root}>
						{mealTypeData.map((mealType) => (
							<FormControlLabel
								key={mealType}
								control={
									<Switch
										color='primary'
										checked={dialogFilters.mealTypes.includes(mealType)}
										onChange={(e) => {
											if (e.target.checked)
												setDialogFilters({
													...dialogFilters,
													mealTypes: dialogFilters.mealTypes.concat(
														mealType
													)
												});
											else
												setDialogFilters({
													...dialogFilters,
													mealTypes: dialogFilters.mealTypes.filter(
														(meal) => meal !== mealType
													)
												});
										}}
									/>
								}
								label={mealType}
							/>
						))}
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					color='primary'
					variant='contained'
					onClick={() => {
						dispatch(setFilters(dialogFilters));
						onClose();
					}}
				>
					<Typography variant='h6'>Apply</Typography>
				</Button>
				<Button color='primary' variant='contained' onClick={onClose}>
					<Typography variant='h6'>Cancel</Typography>
				</Button>
				<Button
					color='primary'
					variant='contained'
					onClick={() => {
						dispatch(setFilters({ veg: false, cuisines: [], mealTypes: [] }));
						setDialogFilters({ veg: false, cuisines: [], mealTypes: [] });
						onClose();
					}}
				>
					<Typography variant='h6'>Clear all filters</Typography>
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default FilterDialog;
