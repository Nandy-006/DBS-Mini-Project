const auth = (req, res, next) => {
	if (req.session && req.session.user) next();
	else res.status(401).send('Please Sign In');
};

const unauth = (req, res, next) => {
	if (!req.session.user) next();
	else res.status(401).send('Please Sign Out First');
};

const authCustomer = (req, res, next) => {
	if (req.session && req.session.user && req.session.user.type === 'customer') next();
	else res.status(401).send('Authorized only to customers');
};

module.exports = { auth, unauth, authCustomer };
