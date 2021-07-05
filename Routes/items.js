const express = require('express');
const pool = require('../Models/dbConfig');
const { getFSSAI, getSetStatement } = require('../Models/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		if (req.session.user.type !== 'delivery') {
			let query = '',
				varcount = 0;
			let params = [];
			if (req.session.user.type === 'customer') {
				query = `SELECT * FROM FOOD_ITEMS NATURAL JOIN (SELECT FSSAI, Rest_Name, isOpen FROM RESTAURANTS) AS RESTUARANTS WHERE isOpen = $${
					varcount + 1
				} AND isAvail = $${varcount + 2}`;
				params = params.concat([true, true]);
				varcount += 2;
			} else {
				query = `SELECT * FROM FOOD_ITEMS WHERE FSSAI = $${++varcount}`;
				params.push(await getFSSAI(req.session.user.uname));
			}

			if (req.session.user.type === 'customer' && req.query.fssai) {
				query += ` AND FSSAI = $${++varcount}`;
				params.push(req.query.fssai);
			}
			if (req.query.name) {
				query += ` AND ItemName ILIKE $${++varcount}`;
				params.push(`%${req.query.name}%`);
			}
			if (req.query.veg === 'true') {
				query += ` AND IsVeg = $${++varcount}`;
				params.push(req.query.veg);
			}
			if (req.query.minPrice) {
				query += ` AND Price >= $${++varcount}`;
				params.push(req.query.minPrice);
			}
			if (req.query.maxPrice) {
				query += ` AND Price <= $${++varcount}`;
				params.push(req.query.maxPrice);
			}
			if (req.query.cuisines && req.query.cuisines.length) {
				const cuisinecount = [];
				for (let i = 0; i < req.query.cuisines.length; i++)
					cuisinecount.push(`$${++varcount}`);
				query += ` AND Cuisine IN (${cuisinecount.join(',')})`;
				params = params.concat(req.query.cuisines);
			}
			if (req.query.mealTypes && req.query.mealTypes.length) {
				const mealtypecount = [];
				for (let i = 0; i < req.query.mealTypes.length; i++)
					mealtypecount.push(`$${++varcount}`);
				query += ` AND Mealtype IN (${mealtypecount.join(',')})`;
				params = params.concat(req.query.mealTypes);
			}
			query += ' ORDER BY Price';
			const items = await pool.query(query, params);
			res.send(items.rows);
		} else res.status(403).send({ message: 'Unauthorized' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

let fssai;
router.use(async (req, res, next) => {
	if (req.session.user.type === 'restaurant') {
		fssai = await getFSSAI(req.session.user.uname);
		next();
	} else res.status(403).send({ message: 'Unauthorized' });
});

router.get('/:item_no', async (req, res) => {
	try {
		const item = await pool.query('SELECT * FROM FOOD_ITEMS WHERE FSSAI = $1 AND ItemNo = $2', [
			fssai,
			req.params.item_no
		]);
		if (item.rowCount) res.send(item.rows[0]);
		else res.status(404).send({ message: 'Item Not Found' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.post('/', async (req, res) => {
	try {
		let result = await pool.query('SELECT COUNT(*) AS Count FROM FOOD_ITEMS WHERE FSSAI = $1', [
			fssai
		]);
		result = await pool.query(
			'INSERT INTO FOOD_ITEMS VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
			[
				parseInt(result.rows[0].count) + 1,
				fssai,
				req.body.itemname,
				req.body.img_link,
				req.body.itemdesc,
				req.body.isavail,
				req.body.isveg,
				req.body.cuisine,
				req.body.mealtype,
				req.body.price
			]
		);
		res.send(result.rows[0]);
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.patch('/:item_no', async (req, res) => {
	try {
		let item = await pool.query('SELECT * FROM FOOD_ITEMS WHERE FSSAI = $1 AND ItemNo = $2', [
			fssai,
			req.params.item_no
		]);
		if (item.rowCount) {
			if (req.body.hasOwnProperty('isavail')) {
				await pool.query(
					'UPDATE FOOD_ITEMS SET isAvail = $1 WHERE FSSAI = $2 AND ItemNo = $3',
					[req.body.isavail, fssai, req.params.item_no]
				);
				req.app.get('io').emit('itemAvail', req.body.isavail);
				delete req.body.isavail;
			}

			if (Object.keys(req.body).length) {
				const setItemStatement = getSetStatement(req.body);
				item = await pool.query(
					`
				UPDATE FOOD_ITEMS ${setItemStatement.query} 
				WHERE FSSAI = $${setItemStatement.nextIndex} AND
				ItemNo = $${setItemStatement.nextIndex + 1} RETURNING *
				`,
					setItemStatement.params.concat([fssai, req.params.item_no])
				);
			}
			res.send(item.rows[0]);
		} else res.status(404).send({ message: 'Item not found' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

router.delete('/:item_no', async (req, res) => {
	try {
		const result = await pool.query(
			'DELETE FROM FOOD_ITEMS WHERE FSSAI = $1 AND ItemNo = $2 RETURNING *',
			[fssai, req.params.item_no]
		);
		if (result.rowCount) res.send({ message: 'Item Deleted!' });
		else res.status(404).send({ message: 'Item not found' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ message: err.message, stack: err.stack });
	}
});

module.exports = router;
