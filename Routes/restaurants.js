const express = require('express');
const pool = require('../Models/dbConfig');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		let query = `SELECT *, (SELECT AVG(RATING) FROM RATINGS WHERE FSSAI = R.FSSAI) AS RATING, (SELECT COUNT(RATING) FROM RATINGS WHERE FSSAI = R.FSSAI) AS COUNT 
			FROM RESTAURANTS R WHERE isOpen = $1`;
		let varcount = 1;
		let params = [true];
		if (req.query.name) {
			query += ` AND Rest_Name ILIKE $${++varcount}`;
			params.push(`%${req.query.name}%`);
		}
		if (req.query.veg === 'true') {
			query += ` AND R.isVeg = $${++varcount}`;
			params.push(true);
		}
		if (req.query.cuisines && req.query.cuisines.length) {
			const cuisinecount = [];
			for (let i = 0; i < req.query.cuisines.length; i++) cuisinecount.push(`$${++varcount}`);
			query += ` AND EXISTS ( SELECT * FROM FOOD_ITEMS FI WHERE FI.FSSAI = R.FSSAI AND FI.Cuisine IN (${cuisinecount.join(
				','
			)}))`;
			params = params.concat(req.query.cuisines);
		}
		if (req.query.mealTypes && req.query.mealTypes.length) {
			const mealtypecount = [];
			for (let i = 0; i < req.query.mealTypes.length; i++)
				mealtypecount.push(`$${++varcount}`);
			query += ` AND EXISTS ( SELECT * FROM FOOD_ITEMS FI WHERE FI.FSSAI = R.FSSAI AND FI.Mealtype IN (${mealtypecount.join(
				','
			)}))`;
			params = params.concat(req.query.mealTypes);
		}
		const restaurants = await pool.query(query, params);
		res.send(restaurants.rows);
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.get('/:fssai', async (req, res) => {
	try {
		const restaurant = await pool.query(
			`SELECT *, (SELECT AVG(RATING) FROM RATINGS WHERE FSSAI = $1) AS RATING, (SELECT COUNT(RATING) FROM RATINGS WHERE FSSAI = $1) AS COUNT 
			FROM RESTAURANTS WHERE FSSAI = $1 AND isOpen = $2`,
			[req.params.fssai, true]
		);
		const restaurant_phones = await pool.query(
			'SELECT * FROM RESTAURANT_PHONE WHERE FSSAI = $1',
			[req.params.fssai]
		);
		const items = await pool.query(
			'SELECT * FROM FOOD_ITEMS WHERE FSSAI = $1 AND isAvail = $2',
			[req.params.fssai, true]
		);
		if (restaurant.rowCount)
			res.send({
				restaurant: restaurant.rows[0],
				restaurant_phones: restaurant_phones.rows,
				items: items.rows
			});
		else res.status(404).send({ message: 'Restaurant not found' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

module.exports = router;
