const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../Models/dbConfig');
const { getSetStatement, getFSSAI } = require('../Models/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const result = {};
		const user = await pool.query('SELECT * FROM USERS WHERE Uname = $1', [
			req.session.user.uname
		]);
		result.user = user.rows[0];
		result.type = req.session.user.type;
		if (req.session.user.type === 'customer') {
			const customer = await pool.query('SELECT * FROM CUSTOMERS WHERE Cust_Uname = $1', [
				req.session.user.uname
			]);
			result.customer = customer.rows[0];
		} else if (req.session.user.type === 'restaurant') {
			const restaurant = await pool.query('SELECT * FROM RESTAURANTS WHERE Rest_Uname = $1', [
				req.session.user.uname
			]);
			result.restaurant = restaurant.rows[0];
			const phones = await pool.query('SELECT * FROM RESTAURANT_PHONE WHERE FSSAI = $1', [
				restaurant.rows[0].fssai
			]);
			result.phones = phones.rows;
		} else {
			const delivery = await pool.query(
				'SELECT * FROM DELIVERY_PERSONS WHERE Del_Uname = $1',
				[req.session.user.uname]
			);
			result.delivery = delivery.rows[0];
		}
		res.send(result);
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.patch('/', async (req, res) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const patch = req.body;

		if (patch.changepass) {
			const credentials = await pool.query('SELECT * FROM USERS WHERE Uname = $1', [
				req.session.user.uname
			]);
			if (bcrypt.compareSync(patch.changepass.old, credentials.rows[0].pass)) {
				await pool.query('UPDATE USERS SET PASS = $1 WHERE Uname = $2', [
					bcrypt.hashSync(patch.changepass.new, 12),
					req.session.user.uname
				]);
			} else {
				res.send({ message: 'Wrong Old Password' });
			}
			delete patch.changepass;
		}

		if (req.session.user.type === 'restaurant' && patch.hasOwnPropert('isopen')) {
			await pool.query('UPDATE RESTAURANTS SET isOpen = $1 WHERE Rest_Uname = $2', [
				patch.isopen,
				req.session.user.uname
			]);
			req.app.get('io').emit('restaurantOpen', patch.isopen);
			delete patch.isopen;
		} else if (req.session.user.type === 'delivery' && patch.hasOwnProperty('isavail')) {
			await pool.query('UPDATE DELIVERY_PERSONS SET isAvail = $1 WHERE Del_Uname = $2', [
				patch.isAvail,
				req.session.user.uname
			]);
			delete patch.isAvail;
		}

		let updatedUser = null;
		if (patch.user) {
			if (Object.keys(patch.user).length) {
				const setUserStatement = getSetStatement(patch.user);
				updatedUser = await client.query(
					`UPDATE USERS ${setUserStatement.query} WHERE uname = $${setUserStatement.nextIndex} RETURNING *`,
					setUserStatement.params.concat([req.session.user.uname])
				);
			}
		}

		let updatedType = null;
		if (patch.type) {
			if (Object.keys(patch.type).length) {
				const setTypeStatement = getSetStatement(patch.type);
				if (req.session.user.type === 'customer') {
					updatedType = await client.query(
						`UPDATE CUSTOMERS ${setTypeStatement.query} WHERE Cust_Uname = $${setTypeStatement.nextIndex} RETURNING *`,
						setTypeStatement.params.concat([req.session.user.uname])
					);
				} else if (req.session.user.type === 'restaurant') {
					updatedType = await client.query(
						`UPDATE RESTAURANTS ${setTypeStatement.query} WHERE Rest_Uname = $${setTypeStatement.nextIndex} RETURNING *`,
						setTypeStatement.params.concat([req.session.user.uname])
					);
				} else {
					updatedType = await client.query(
						`UPDATE DELIVERY_PERSONS ${setTypeStatement.query} WHERE Del_Uname = $${setTypeStatement.nextIndex} RETURNING *`,
						setTypeStatement.params.concat([req.session.user.uname])
					);
				}
			}
		}
		await client.query('COMMIT');
		res.send({
			updatedUser: updatedUser,
			updatedType: updatedType
		});
	} catch (err) {
		await client.query('ROLLBACK');
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	} finally {
		client.release();
	}
});

router.delete('/', async (req, res) => {
	try {
		const uname = req.session.user.uname;
		await pool.query('DELETE FROM USERS WHERE UNAME = $1', [uname]);
		req.session.destroy();
		res.send({ message: `Account of ${uname} deleted` });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.post('/:phone', async (req, res) => {
	try {
		if (req.session.user.type !== 'restaurant')
			res.status(401).send('Authorized only for restaurants');
		else {
			const fssai = await getFSSAI(req.session.user.uname);
			const result = await pool.query(
				'INSERT INTO RESTAURANT_PHONE VALUES($1, $2) RETURNING *',
				[fssai, req.params.phone]
			);
			res.status(202).send({ result: result.rows[0] });
		}
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.delete('/:phone', async (req, res) => {
	try {
		if (req.session.user.type !== 'restaurant') {
			res.status(403).send({
				message: 'Authorized only for restaurants'
			});
		} else {
			const result = await pool.query(
				'DELETE FROM RESTAURANT_PHONE WHERE FSSAI = $1 AND Phone = $2',
				[await getFSSAI(req.session.user.uname), req.params.phone]
			);
			if (result.rowCount) res.send({ message: 'Successfully deleted!' });
			else res.status(404).send({ message: 'Phone number not found' });
		}
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

module.exports = router;
