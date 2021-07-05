const express = require('express');
const pool = require('../Models/dbConfig');
const { getFSSAI } = require('../Models/helpers');

const router = express();

router.get('/:fssai', async (req, res) => {
	try {
		if (req.session.user.type === 'customer') {
			const ratings = await pool.query(
				'SELECT * FROM RATINGS WHERE FSSAI = $1 ORDER BY ReviewTime DESC',
				[req.params.fssai]
			);
			res.send(ratings.rows);
		} else if (req.session.user.type === 'restaurant') {
			const ratings = await pool.query(
				'SELECT * FROM RATINGS WHERE FSSAI = $1 ORDER BY ReviewTime DESC',
				[await getFSSAI(req.session.user.uname)]
			);
			res.send(ratings.rows);
		} else res.status(403).send({ message: 'Unauthorized' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ stack: err.stack, message: err.message });
	}
});

router.post('/:fssai', async (req, res) => {
	try {
		if (req.session.user.type === 'customer') {
			const rating = await pool.query('INSERT INTO RATINGS VALUES ($1, $2, $3, $4, $5)', [
				req.params.fssai,
				req.session.user.uname,
				new Date(),
				req.body.rating,
				req.body.review
			]);
			res.send({ message: 'Review added' });
		} else res.status(403).send({ message: 'Unauthorized' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ stack: err.stack, message: err.message });
	}
});

module.exports = router;
