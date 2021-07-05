import React from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent } from '@material-ui/core';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { getCenter } from 'geolib';

const ViewMapDialog = ({ open, setOpen }) => {
	const details = useSelector((state) => state.socket.orderDetails);
	console.log('DETAILS', details);
	const center = getCenter([
		{
			latitude: parseFloat(details.customer.lat),
			longitude: parseFloat(details.customer.long)
		},
		{
			latitude: parseFloat(details.restaurant.lat),
			longitude: parseFloat(details.restaurant.long)
		},
		{
			latitude: parseFloat(details.delivery.lat),
			longitude: parseFloat(details.delivery.long)
		}
	]);

	return (
		<Dialog
			open={open}
			onClose={() => {
				setOpen(false);
			}}
		>
			<DialogContent>
				<MapContainer
					center={[center.latitude, center.longitude]}
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
							parseFloat(details.customer.lat),
							parseFloat(details.customer.long)
						]}
						title={details.customer.firstname}
					/>
					<Marker
						position={[
							parseFloat(details.restaurant.lat),
							parseFloat(details.restaurant.long)
						]}
						title={details.restaurant.rest_name}
					/>
					<Marker
						position={[
							parseFloat(details.delivery.lat),
							parseFloat(details.delivery.long)
						]}
						title={details.delivery.first_name}
					/>
					<Polyline
						pathOptions={{ color: 'purple' }}
						positions={[
							[parseFloat(details.customer.lat), parseFloat(details.customer.long)],
							[
								parseFloat(details.restaurant.lat),
								parseFloat(details.restaurant.long)
							],
							[parseFloat(details.delivery.lat), parseFloat(details.delivery.long)]
						]}
					/>
				</MapContainer>
			</DialogContent>
		</Dialog>
	);
};

export default ViewMapDialog;
