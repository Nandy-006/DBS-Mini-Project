const pool = require('./dbConfig');

const getSetStatement = (patch, initialNum = 1) => {
	let query = 'SET';
	const params = [];
	let i = 0;
	Object.entries(patch).forEach((entry) => {
		if (i) query += ',';
		query += ` ${entry[0]} = $${initialNum + i++}`;
		params.push(entry[1]);
	});
	return { query, params, nextIndex: initialNum + i };
};

const getRestUname = async (fssai) => {
	const result = await pool.query(
		'SELECT * FROM RESTAURANTS WHERE FSSAI = $1',
		[fssai]
	);
	if (result.rowCount) return result.rows[0].rest_uname;
	return null;
};

const getFSSAI = async (restUname) => {
	const result = await pool.query(
		'SELECT * FROM RESTAURANTS WHERE Rest_Uname = $1',
		[restUname]
	);
	if (result.rowCount) return result.rows[0].fssai;
	return null;
};

module.exports = { getSetStatement, getRestUname, getFSSAI };
