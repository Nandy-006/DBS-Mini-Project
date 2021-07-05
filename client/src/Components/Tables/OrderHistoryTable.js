import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	withStyles,
	Table,
	TableContainer,
	TableCell,
	TableHead,
	TableRow,
	TableBody
} from '@material-ui/core';
import moment from 'moment';

const StyledTableCell = withStyles({
	root: {
		fontSize: 16
	}
})(TableCell);

const OrderHistoryTable = ({ orders }) => {
	const user = useSelector((state) => state.user);
	const history = useHistory();
	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<StyledTableCell>
							<b>Order number</b>
						</StyledTableCell>
						<StyledTableCell>
							<b>Order Time</b>
						</StyledTableCell>
						<StyledTableCell>
							{user.type !== 'customer' && <b>Customer</b>}
						</StyledTableCell>
						<StyledTableCell>
							{user.type !== 'restaurant' && <b>Restaurant</b>}
						</StyledTableCell>
						<StyledTableCell>
							{user.type !== 'delivery' && <b>Delivered by</b>}
						</StyledTableCell>
						<StyledTableCell>
							<b>Total Quantity</b>
						</StyledTableCell>
						<StyledTableCell>
							<b>Total Price</b>
						</StyledTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{orders.map((order) => {
						return (
							<TableRow
								key={order.orderno}
								hover
								style={{ cursor: 'pointer' }}
								onClick={() => history.push(`/orders/${order.orderno}`)}
							>
								<StyledTableCell>{order.orderno}</StyledTableCell>
								<StyledTableCell>
									{moment(order.ordertime).format('D MMM YYYY h:mm A')}
								</StyledTableCell>
								<StyledTableCell>
									{user.type !== 'customer' && order.cust_name}
								</StyledTableCell>
								<StyledTableCell>
									{user.type !== 'restaurant' && order.rest_name}
								</StyledTableCell>
								<StyledTableCell>
									{user.type !== 'delivery' && order.del_name
										? order.del_name
										: 'Yet to be assigned'}
								</StyledTableCell>
								<StyledTableCell>{order.quantity}</StyledTableCell>
								<StyledTableCell>
									{parseFloat(order.price) + parseFloat(order.del_charge)}
								</StyledTableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default OrderHistoryTable;
