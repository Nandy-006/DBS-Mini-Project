import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { setErrorBar } from '../../Redux/varSlice';

const PositionMarker = ({ lat, long, setLat, setLong }) => {
	const markerRef = useRef(null);
	useMapEvents({
		click(e) {
			setLat(e.latlng.lat);
			setLong(e.latlng.lng);
		}
	});
	const eventHandlers = useMemo(
		() => ({
			dragend() {
				const marker = markerRef.current;
				if (marker != null) {
					setLat(marker.getLatLng().lat);
					setLong(marker.getLatLng().lng);
				}
			}
		}),
		[setLat, setLong]
	);

	return (
		<Marker
			draggable={true}
			eventHandlers={eventHandlers}
			position={[lat, long]}
			ref={markerRef}
		/>
	);
};

const MapDialog = ({ open, setOpen, handleComplete }) => {
	const [lat, setLat] = useState('');
	const [long, setLong] = useState('');

	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const loc = await axios.get('/location');
				setLat(parseFloat(loc.data.lat));
				setLong(parseFloat(loc.data.long));
			} catch (err) {
				setOpen(false);
				dispatch(setErrorBar(err.response.data.message));
			}
		};
		fetchData();
	}, [dispatch, open, setOpen]);

	return (
		<Dialog open={open} onClose={() => handleComplete(null)}>
			<DialogTitle>
				<Typography variant='h6'>Choose your location</Typography>
			</DialogTitle>
			<DialogContent>
				<MapContainer
					center={[lat, long]}
					zoom={15}
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
					<PositionMarker lat={lat} long={long} setLat={setLat} setLong={setLong} />
				</MapContainer>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					startIcon={<DoneIcon />}
					onClick={() => {
						handleComplete({ lat, long });
					}}
					color='primary'
				>
					Done
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default MapDialog;
