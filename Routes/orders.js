const express = require('express');
const pool = require('../Models/dbConfig');
const { getRestUname, getFSSAI } = require('../Models/helpers');
const { getSocketID } = require('../socket');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		if (req.session.user.type === 'restaurant' && req.query.pending) {
			const orders = await pool.query(
				`
				SELECT OrderNo, OrderTime, isPrepared, Cust_FirstName AS Customer
				FROM (SELECT * FROM ORDERS WHERE FSSAI = $1 AND isReceived = $2) AS RESTAURANT 
						NATURAL JOIN (SELECT Uname AS Cust_Uname, FirstName AS Cust_FirstName FROM USERS) AS CUSTOMER_NAME 
				`,
				[await getFSSAI(req.session.user.uname), false]
			);
			const result = await Promise.all(
				orders.rows.map(async (order) => {
					const contents = await pool.query(
						`
					SELECT ItemNo, ItemName, Quantity, (Quantity*Price) AS Price 
					FROM ORDER_CONTENTS NATURAL JOIN FOOD_ITEMS WHERE OrderNo = $1
					`,
						[order.orderno]
					);
					return { ...order, contents: contents.rows };
				})
			);
			console.log('RESULT', result);
			res.send({ orders: result });
		} else if (req.session.user.type === 'delivery' && req.query.check) {
			const result = await pool.query(
				'SELECT * FROM ORDERS WHERE isAssigned = $1 AND isPaid = $2 AND Del_Uname = $3',
				[true, false, req.session.user.uname]
			);
			res.send(result.rows);
		} else {
			let whereClause, firstParam;
			if (req.session.user.type === 'customer') {
				whereClause = 'Cust_Uname';
				firstParam = req.session.user.uname;
			} else if (req.session.user.type === 'restaurant') {
				whereClause = 'FSSAI';
				firstParam = await getFSSAI(req.session.user.uname);
			} else {
				whereClause = 'Del_Uname';
				firstParam = req.session.user.uname;
			}

			const orders = await pool.query(
				`
                SELECT OrderNo, OrderTime, isAssigned, isPaid, Cust_name, Rest_name, Del_name, SUM(Quantity) AS Quantity, (SUM(Quantity*Price)) AS Price, Del_Charge
				FROM (((((SELECT OrderNo, OrderTime, isAssigned, isPaid, Cust_Uname, FSSAI, Del_Uname, Del_Charge FROM ORDERS WHERE ${whereClause} = $1 AND isPlaced = $2) AS O
					NATURAL JOIN (SELECT Uname AS Cust_Uname, Firstname AS Cust_name FROM USERS) AS C)
					NATURAL JOIN (SELECT FSSAI, Rest_Name FROM RESTAURANTS) AS R)
					LEFT OUTER JOIN (SELECT Uname, FirstName AS Del_name FROM USERS) AS D ON Del_Uname = Uname)
					NATURAL JOIN (SELECT OrderNo, ItemNo, Quantity FROM ORDER_CONTENTS) AS OC)
					NATURAL JOIN (SELECT ItemNo, FSSAI, Price FROM FOOD_ITEMS) AS FI
				GROUP BY (OrderNo, OrderTime, isAssigned, isPaid, Cust_name, Rest_name, Del_name, Del_Charge)
				ORDER BY OrderTime DESC;
                `,
				[firstParam, true]
			);
			res.send(orders.rows);
		}
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.get('/:order_no', async (req, res) => {
	try {
		const order = await pool.query(
			'SELECT * FROM ORDERS WHERE OrderNo = $1 AND isPlaced = $2',
			[req.params.order_no, true]
		);
		if (!order.rowCount) res.status(404).send({ message: 'Order does not exist' });
		else if (
			(req.session.user.type === 'customer' &&
				req.session.user.uname === order.rows[0].cust_uname) ||
			(req.session.user.type === 'delivery' &&
				req.session.user.uname === order.rows[0].del_uname) ||
			(req.session.user.type === 'restaurant' &&
				req.session.user.uname === (await getRestUname(order.rows[0].fssai)))
		) {
			const customer = await pool.query(
				'SELECT * FROM USERS, CUSTOMERS WHERE Cust_Uname = $1 AND Cust_Uname = Uname',
				[order.rows[0].cust_uname]
			);
			const restaurant = await pool.query(
				`SELECT *, (SELECT AVG(RATING) FROM RATINGS WHERE FSSAI = $1) AS RATING, (SELECT COUNT(RATING) FROM RATINGS WHERE FSSAI = $1) AS COUNT 
			FROM RESTAURANTS WHERE FSSAI = $1`,
				[order.rows[0].fssai]
			);
			const phones = await pool.query('SELECT * FROM RESTAURANT_PHONE WHERE FSSAI = $1', [
				order.rows[0].fssai
			]);
			let delivery = null;
			if (order.rows[0].del_uname) {
				delivery = await pool.query(
					'SELECT * FROM USERS, DELIVERY_PERSONS WHERE Del_Uname = $1 AND Del_Uname = Uname',
					[order.rows[0].del_uname]
				);
			}
			const orderContent = await pool.query(
				`
                SELECT FI.ItemNo, FI.ItemName, FI.Price, OC.Quantity FROM ORDER_CONTENTS OC, FOOD_ITEMS FI
				WHERE OC.OrderNo = $1 AND OC.ItemNo = FI.ItemNo AND OC.FSSAI = FI.FSSAI;
                `,
				[req.params.order_no]
			);
			res.send({
				order: order.rows[0],
				orderContent: orderContent.rows,
				customer: customer.rows[0],
				restaurant: restaurant.rows[0],
				restaurant_phones: phones.rows,
				delivery: delivery ? delivery.rows[0] : delivery
			});
		} else res.status(403).send({ message: 'Unauthorized' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.delete('/:order_no', async (req, res) => {
	try {
		const order = await pool.query(
			'SELECT * FROM ORDERS WHERE OrderNo = $1 AND isPlaced = $2',
			[req.params.order_no, true]
		);
		if (!order.rowCount) res.status(404).send({ message: 'Order does not exist' });
		else if (order.rows[0].isPrepared) {
			res.status(403).send({
				message: 'Cannot cancel order after prepared.'
			});
		} else {
			await pool.query('DELETE FROM ORDERS WHERE OrderNo = $1', [req.params.order_no]);
			res.send({ message: 'Cancelled Order!' });
		}
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.patch('/:order_no', async (req, res) => {
	try {
		let order = await pool.query('SELECT * FROM ORDERS WHERE OrderNo = $1 AND isPlaced = $2', [
			req.params.order_no,
			true
		]);
		if (!order.rowCount) res.status(404).send({ message: 'Order does not exist' });
		else if (
			(req.session.user.type === 'customer' &&
				req.session.user.uname === order.rows[0].cust_uname) ||
			(req.session.user.type === 'delivery' &&
				req.session.user.uname === order.rows[0].del_uname) ||
			(req.session.user.type === 'restaurant' &&
				req.session.user.uname === (await getRestUname(order.rows[0].fssai)))
		) {
			const rest_uname = await getRestUname(order.rows[0].fssai);
			let eventType = null,
				columnType = null;
			if (req.body.isprepared) {
				eventType = 'prepared';
				columnType = 'isPrepared';
			} else if (req.body.isreceived) {
				eventType = 'received';
				columnType = 'isReceived';
			} else if (req.body.isdelivered) {
				eventType = 'delivered';
				columnType = 'isDelivered';
			} else if (req.body.ispaid) {
				eventType = 'paid';
				columnType = 'isPaid';
			}

			console.log({ eventType, columnType });

			order = await pool.query(
				`UPDATE ORDERS SET ${columnType} = $1 WHERE OrderNo = $2 RETURNING *`,
				[true, req.params.order_no]
			);
			if (req.body.isPaid) {
				await pool.query('UPDATE DELIVERY_PERSONS SET isAvail = $1 WHERE Del_Uname = $2', [
					true,
					order.rows[0].del_uname
				]);
			}

			if (getSocketID(order.rows[0].cust_uname)) {
				req.app
					.get('io')
					.to(getSocketID(order.rows[0].cust_uname))
					.emit(eventType, order.rows[0]);
				console.log('Sent', eventType);
			}
			if (getSocketID(rest_uname))
				req.app.get('io').to(getSocketID(rest_uname)).emit(eventType, order.rows[0]);
			if (getSocketID(order.rows[0].del_uname))
				req.app
					.get('io')
					.to(getSocketID(order.rows[0].del_uname))
					.emit(eventType, order.rows[0]);

			res.send(order.rows[0]);
		} else res.status(403).send({ message: 'Unauthorized' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

module.exports = router;
