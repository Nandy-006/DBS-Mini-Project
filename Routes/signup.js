const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../Models/dbConfig');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		if (req.query.uname) {
			const users = await pool.query('SELECT * FROM USERS WHERE UNAME = $1', [
				req.query.uname
			]);
			res.send({ isTaken: users.rowCount });
		} else res.send({ message: 'Sign Up Page' });
	} catch (err) {
		console.error(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.post('/', async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const user = req.body;
		user.pass = bcrypt.hashSync(user.pass, 12);
		const result = {};
		const newUser = await client.query(
			'INSERT INTO USERS VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[user.uname, user.pass, user.firstname, user.lastname, user.phone, user.email]
		);
		result.user = newUser.rows;

		if (user.type === 'customer') {
			const customer = await client.query(
				'INSERT INTO CUSTOMERS VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
				[user.uname, user.aline1, user.aline2, user.city, user.pin, user.lat, user.long]
			);
			result.customer = customer.rows;
		} else if (user.type === 'restaurant') {
			const restaurant = await client.query(
				'INSERT INTO RESTAURANTS VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
				[
					user.uname,
					user.fssai,
					user.rest_name,
					user.img_link,
					user.aline1,
					user.aline2,
					user.city,
					user.pin,
					user.lat,
					user.long,
					false,
					user.isveg
				]
			);
			result.restaurant = restaurant.rows;
			result.phones = [];
			user.phones.forEach(async (phone) => {
				const newPhone = await client.query(
					'INSERT INTO RESTAURANT_PHONE VALUES ($1, $2) RETURNING *',
					[user.fssai, phone]
				);
				result.phones.push(newPhone.rows[0]);
			});
		} else {
			const delivery = await client.query(
				'INSERT INTO DELIVERY_PERSONS VALUES ($1, $2, $3, $4, $5, $6, $7)',
				[user.uname, user.vno, user.vmodel, user.vcolour, false, user.lat, user.long]
			);
			result.delivery = delivery.rows;
		}
		await client.query('COMMIT');
		res.status(202).send(result);
	} catch (err) {
		await client.query('ROLLBACK');
		if (err.constraint === 'users_pkey')
			res.status(409).send({ message: 'Username already exists' });
		else {
			console.error(err.stack);
			res.status(500).send({ message: err.message, stack: err.stack });
		}
	} finally {
		client.release();
	}
});

module.exports = router;
