import React, { useState } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Button,
	TextField,
	Grid,
	FormControlLabel,
	Checkbox,
	Select,
	FormControl,
	InputLabel,
	MenuItem
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { cuisineData, mealTypeData } from '../../data';

const EditItemDialog = ({ open, onClose, item }) => {
	const [itemname, setItemname] = useState(item.itemname);
	const [image, setImage] = useState(null);
	const [itemdesc, setItemdesc] = useState(item.itemdesc);
	const [isavail, setIsavail] = useState(item.isavail);
	const [isveg, setIsveg] = useState(item.isveg);
	const [cuisine, setCuisine] = useState(item.cuisine);
	const [mealtype, setMealtype] = useState(item.mealtype);
	const [price, setPrice] = useState(item.price);
	const [edit, setEdit] = useState(false);

	return (
		<Dialog open={open} onClose={() => onClose('CANCEL')} fullWidth maxWidth='sm'>
			<DialogTitle>
				<Typography variant='h6'>Edit Item</Typography>
			</DialogTitle>
			<DialogContent style={{ overflow: 'hidden' }}>
				<Grid
					container
					direction='column'
					justify='center'
					alignItems='stretch'
					spacing={2}
				>
					<Grid item>
						<TextField
							variant='outlined'
							label='Item Name'
							value={itemname}
							fullWidth
							required
							onChange={(e) => setItemname(e.target.value)}
							disabled={!edit}
						/>
					</Grid>
					<Grid item>
						<TextField
							variant='outlined'
							label='Item description'
							value={itemdesc}
							fullWidth
							multiline
							rows={4}
							onChange={(e) => setItemdesc(e.target.value)}
							disabled={!edit}
						/>
					</Grid>
					<Grid item>
						<Button
							variant='contained'
							component='label'
							color='primary'
							disabled={Boolean(image) || !edit}
							fullWidth
						>
							{image ? `Uploaded: ${image.name}` : 'Change Item Image'}
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
					<Grid item>
						<Grid container justify='center' spacing={6}>
							<Grid item>
								<FormControlLabel
									control={
										<Checkbox
											checked={isveg}
											onChange={(e) => setIsveg(e.target.checked)}
											color='primary'
										/>
									}
									label='Veg'
									disabled={!edit}
								/>
							</Grid>
							<Grid item>
								<FormControlLabel
									control={
										<Checkbox
											checked={isavail}
											onChange={(e) => setIsavail(e.target.checked)}
											color='primary'
										/>
									}
									label='Available'
									disabled={!edit}
								/>
							</Grid>
							<Grid item>
								<TextField
									variant='outlined'
									label='Price'
									value={price}
									fullWidth
									onChange={(e) => setPrice(e.target.value)}
									disabled={!edit}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Grid item>
						<Grid container justify='center' alignItems='stretch' spacing={4}>
							<Grid item>
								<FormControl
									variant='outlined'
									style={{ minWidth: '15vw' }}
									disabled={!edit}
								>
									<InputLabel id='cuisine'>Cuisine</InputLabel>
									<Select
										labelId='cuisine'
										value={cuisine}
										onChange={(e) => setCuisine(e.target.value)}
										label='Cuisine'
										fullWidth
									>
										{cuisineData.map((cuis) => (
											<MenuItem key={cuis} value={cuis}>
												{cuis}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item>
								<FormControl
									variant='outlined'
									style={{ minWidth: '15vw' }}
									disabled={!edit}
								>
									<InputLabel id='mealtype'>Meal Type</InputLabel>
									<Select
										labelId='mealtype'
										value={mealtype}
										onChange={(e) => setMealtype(e.target.value)}
										label='Meal Type'
										fullWidth
									>
										{mealTypeData.map((mt) => (
											<MenuItem key={mt} value={mt}>
												{mt}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					startIcon={<DeleteIcon />}
					onClick={() => {
						setEdit(false);
						onClose('DELETE');
					}}
					color='secondary'
				>
					Delete
				</Button>
				<Button
					variant='contained'
					startIcon={<CloseIcon />}
					onClick={() => {
						setEdit(false);
						onClose('CANCEL');
					}}
					color='primary'
				>
					Cancel
				</Button>
				<Button
					variant='contained'
					startIcon={edit ? <SaveIcon /> : <EditIcon />}
					onClick={() => {
						if (edit) {
							const editedItem = {
								itemname,
								image,
								itemdesc,
								isavail,
								isveg,
								cuisine,
								mealtype,
								price
							};
							onClose(editedItem);
						} else setEdit(true);
					}}
					color='primary'
				>
					{edit ? 'Save' : 'Edit'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditItemDialog;
