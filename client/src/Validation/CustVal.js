const Joi = require('joi');

const custSchema = Joi.object({
	aline1: Joi.string().required().error(new Error('Please provide a valid address')),

	aline2: Joi.string().error(new Error('Please provide a valid address')),

	city: Joi.string().alphanum().required().error(new Error('Please provide a valid city')),

	pin: Joi.string()
		.pattern(new RegExp('[0-9]{6}'))
		.required()
		.error(new Error('Please provide a valid PIN'))
});

export default custSchema;
