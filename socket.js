const socketio = require('socket.io');
const pool = require('./Models/dbConfig');
const { getRestUname } = require('./Models/helpers');

const users = new Map();
let app;

const accept = async (details) => {
	console.log('ACCEPTED', details);
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const order = await client.query(
			'UPDATE ORDERS SET isAssigned = $1, Del_Uname = $2, Del_Charge = $3 WHERE OrderNo = $4 RETURNING *',
			[true, details.delUname, details.delCharge, details.payload.orderNo]
		);
		await client.query('UPDATE DELIVERY_PERSONS SET isAvail = $1 WHERE Del_Uname = $2', [
			false,
			details.delUname
		]);
		await client.query('COMMIT');
		return order.rows[0];
	} catch (err) {
		client.query('ROLLBACK');
		console.log(err.stack);
		res.status(500).send({ stack: err.stack, message: err.message });
	} finally {
		client.release();
	}
};

const reject = (details) => {
	console.log('REJECTED');
	details.payload.rejectedBy.push(details.delUname);
	app.get('workerUtils').addJob('assignDelivery', details.payload, { maxAttempts: 5 });
};

const getKey = (value) => {
	const entry = [...users].find(([key, val]) => val == value);
	if (entry) return entry[0];
	return null;
};

const connect = (server, appReceived) => {
	const io = socketio(server, { cors: { origin: '*' } });
	app = appReceived;

	io.on('connection', (socket) => {
		console.log(`New Connection: ${socket.id}`);
		socket.on('signin', (uname) => {
			console.log(`Signed in ${uname} as ${socket.id}`);
			users.set(uname, socket.id);
		});
		socket.on('delAccepted', async (details) => {
			const order = await accept(details);
			const rest_uname = await getRestUname(order.fssai);
			const res = await pool.query('SELECT * FROM DELIVERY_PERSONS WHERE Del_Uname = $1', [
				details.delUname
			]);
			const delDetails = { delivery: res.rows[0], delCharge: details.delCharge, order };
			console.log(delDetails);
			socket.emit('assigned', delDetails);
			if (users.get(order.cust_uname))
				io.to(users.get(order.cust_uname)).emit('assigned', delDetails);
			if (users.get(rest_uname)) io.to(users.get(rest_uname)).emit('assigned', delDetails);
		});
		socket.on('delRejected', reject);
		socket.on('disconnect', () => {
			if (getKey(socket.id)) users.delete(getKey(socket.id));
			console.log(`Disconnecting: ${socket.id}`);
		});
	});

	return io;
};

const getSocketID = (uname) => {
	console.log(users);
	return users.get(uname);
};

module.exports = { connect, getSocketID };
