import Joi from 'joi';

const userSchema = Joi.object({
	uname: Joi.string()
		.alphanum()
		.min(3)
		.max(30)
		.required()
		.error(() => new Error('Please provide a username (3-30 characters)')),

	pass: Joi.string()
		.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
		.error(
			new Error('Please provide a valid password (only letters and numbers, 3-30 characters')
		),

	confirm: Joi.valid(Joi.ref('pass')).error(new Error('Passwords not matching')),

	firstname: Joi.string().required().error(new Error('Please enter your name')),

	lastname: Joi.string(),

	phone: Joi.string()
		.pattern(new RegExp('[0-9]{10}'))
		.error(new Error('Please provide a valid phone number')),

	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
		.error(new Error('Please provide a valid email'))
});

export default userSchema;
