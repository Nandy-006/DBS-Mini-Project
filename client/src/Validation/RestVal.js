import Joi from 'joi';

const restSchema = Joi.object({
	fssai: Joi.number().required().error(new Error('Please provide a valid FSSAI')),

	rest_name: Joi.string().required().error(new Error('Please provide a valid restaurant name')),

	aline1: Joi.string().required().error(new Error('Please provide a valid address')),

	aline2: Joi.string().error(new Error('Please provide a valid address')),

	city: Joi.string().alphanum().required().error(new Error('Please provide a valid city')),

	pin: Joi.string()
		.pattern(new RegExp('[0-9]{6}'))
		.required()
		.error(new Error('Please provide a PIN')),

	isVeg: Joi.boolean()
		.required()
		.error(new Error('Please mention if restaurant is pure veg or not')),

	phones: Joi.array()
		.items(Joi.string().pattern(new RegExp('[0-9]{8,10}')))
		.required()
		.error(new Error('Please provide valid phone numbers'))
});

export default restSchema;
