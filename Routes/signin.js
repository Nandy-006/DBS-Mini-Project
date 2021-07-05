const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../Models/dbConfig');
const { getFSSAI } = require('../Models/helpers');

const router = express.Router();

const getType = async (uname) => {
	let user = null;
	user = await pool.query('SELECT * FROM CUSTOMERS WHERE Cust_Uname = $1', [uname]);
	if (user.rowCount) return 'customer';

	user = await pool.query('SELECT * FROM RESTAURANTS WHERE Rest_Uname = $1', [uname]);
	if (user.rowCount) return 'restaurant';
	return 'delivery';
};

router.get('/', (req, res) => {
	try {
		res.send({ message: 'Sign In Page' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.post('/', async (req, res) => {
	try {
		const credentials = req.body;
		const pass = await pool.query('SELECT * FROM USERS WHERE UNAME = $1', [credentials.uname]);

		if (pass.rowCount && bcrypt.compareSync(credentials.pass, pass.rows[0].pass)) {
			const type = await getType(credentials.uname);
			req.session.user = {
				uname: credentials.uname,
				type
			};
			if (type == 'restaurant') {
				await pool.query('UPDATE RESTAURANTS SET isOpen = $1 WHERE Rest_Uname = $2', [
					true,
					credentials.uname
				]);
				req.app.get('io').emit('restaurantOpen', true);
			}
			res.status(202).send(req.session.user);
		} else res.status(401).send({ message: 'Invalid Username or Password' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

module.exports = router;
