require('dotenv').config();
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const pool = require('./Models/dbConfig');
const { auth, unauth, authCustomer } = require('./auth');
const { newWorkerUtils, newRunner } = require('./jobHelpers');
const { connect } = require('./socket');
const signup = require('./Routes/signup');
const signin = require('./Routes/signin');
const profile = require('./Routes/profile');
const orders = require('./Routes/orders');
const items = require('./Routes/items');
const restaurants = require('./Routes/restaurants');
const cart = require('./Routes/cart');
const ratings = require('./Routes/ratings');

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
const server = http.createServer(app);
server.listen(process.env.SERVER_PORT, async () => {
	console.log(`Listening on port ${process.env.SERVER_PORT}`);
	app.set('workerUtils', await newWorkerUtils(app));
	app.set('runner', await newRunner());
	app.set('io', connect(server, app));
});

const sessionConfig = {
	store: new PgSession({
		pool,
		tableName: 'user_sessions'
	}),
	secret: process.env.SECRET,
	cookie: {
		maxAge: 1000 * 60 * 60 * 12,
		secure: process.env.MODE !== 'development',
		httpOnly: true
	},
	resave: false,
	saveUninitialized: true
};

app.use(express.json());
app.use(session(sessionConfig));

app.use('/signin', unauth, signin);
app.use('/signup', unauth, signup);
app.use('/profile', auth, profile);
app.use('/orders', auth, orders);
app.use('/items', auth, items);
app.use('/restaurants', authCustomer, restaurants);
app.use('/cart', authCustomer, cart);
app.use('/ratings', auth, ratings);

app.post('/signout', auth, async (req, res) => {
	try {
		if (req.session.user.type === 'restaurant') {
			await pool.query('UPDATE RESTAURANTS SET isOpen = $1 WHERE Rest_Uname = $2', [
				false,
				req.session.user.uname
			]);
			req.app.get('io').emit('restaurantOpen', false);
		} else if (req.session.user.type === 'delivery') {
			await pool.query('UPDATE DELIVERY_PERSONS SET isAvail = $1 WHERE Del_Uname = $2', [
				false,
				req.session.user.uname
			]);
		}
		req.session.destroy();
		res.send({ message: 'Signed Out!' });
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ stack: err.stack, message: err.message });
	}
});

app.get('/session', (req, res) => {
	res.send({ user: req.session.user });
});

app.get('/location', auth, async (req, res) => {
	try {
		let from, where;
		if (req.session.user.type === 'customer') {
			from = 'CUSTOMERS';
			where = 'Cust_Uname';
		} else if (req.session.user.type === 'restaurant') {
			from = 'RESTAURANTS';
			where = 'Rest_Uname';
		} else {
			from = 'DELIVERY_PERSONS';
			where = 'Del_Uname';
		}
		const result = await pool.query(`SELECT Lat, Long FROM ${from} WHERE ${where} = $1`, [
			req.session.user.uname
		]);
		res.send(result.rows[0]);
	} catch (err) {
		console.log(err.stack);
		res.status(500).send({ stack: err.stack, message: err.message });
	}
});

app.use((req, res) => {
	res.status(404).send({ message: 'Page not found' });
});
