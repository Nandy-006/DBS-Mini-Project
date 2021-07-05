import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	Button
} from '@material-ui/core';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import { setDelQuery, setOrderAvail } from '../../Redux/socketSlice';

const DelQueryDialog = () => {
	const open = useSelector((state) => state.socket.openDelQuery);
	const details = useSelector((state) => state.socket.delQueryDetails);
	const socket = useSelector((state) => state.socket.socket);
	const dispatch = useDispatch();

	if (open) console.log(details);

	return (
		<>
			{details && (
				<Dialog
					open={open}
					onClose={() => {
						socket.emit('delRejected', details);
						dispatch(setDelQuery({ open: false, details: null }));
					}}
				>
					<DialogTitle>
						<Typography variant='h6'>Order available</Typography>
					</DialogTitle>
					<DialogContent>
						<MapContainer
							center={[details.center.latitude, details.center.longitude]}
							zoom={14}
							scrollWheelZoom={false}
							style={{ height: '50vh', width: '35vw' }}
						>
							<TileLayer
								attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
								url='https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
								maxZoom={18}
								id='mapbox/streets-v11'
								tileSize={512}
								zoomOffset={-1}
								accessToken={process.env.REACT_APP_MAPBOX}
							/>
							<Marker
								position={[
									details.payload.cust_loc.lat,
									details.payload.cust_loc.long
								]}
								title='Customer'
							/>
							<Marker
								position={[
									details.payload.rest_loc.lat,
									details.payload.rest_loc.long
								]}
								title='Restaurant'
							/>
							<Marker
								position={[details.del_loc.latitude, details.del_loc.longitude]}
								title='You'
							/>
							<Polyline
								pathOptions={{ color: 'purple' }}
								positions={[
									[details.payload.cust_loc.lat, details.payload.cust_loc.long],
									[details.payload.rest_loc.lat, details.payload.rest_loc.long],
									[details.del_loc.latitude, details.del_loc.longitude]
								]}
							/>
						</MapContainer>
						<Typography variant='h6'>
							Delivery charges = {details.delCharge} &nbsp;&nbsp;&nbsp; Distance ={' '}
							{details.distance / 1000} km
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button
							variant='contained'
							startIcon={<DoneIcon />}
							onClick={async () => {
								socket.emit('delAccepted', details);
								dispatch(setDelQuery({ open: false, details }));
								dispatch(setOrderAvail(details.payload.orderNo));
							}}
							color='primary'
						>
							Accept
						</Button>
						<Button
							variant='contained'
							startIcon={<CancelIcon />}
							onClick={() => {
								socket.emit('delRejected', details);
								dispatch(setDelQuery({ open: false, details: null }));
							}}
							color='secondary'
						>
							Reject
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
};

export default DelQueryDialog;
