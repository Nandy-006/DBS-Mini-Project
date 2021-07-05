const Joi = require('joi');

const delSchema = Joi.object({
	vno: Joi.string().alphanum().required().error(new Error('Please provide a vehicle number')),

	vmodel: Joi.string().required().error(new Error('Please provide a valid vehicle model')),

	vcolour: Joi.string()
		.alphanum()
		.required()
		.error(new Error('Please provide a valid vehicle colour'))
});

export default delSchema;
