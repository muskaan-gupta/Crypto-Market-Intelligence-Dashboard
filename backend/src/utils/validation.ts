import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createAlertSchema = Joi.object({
  coinId: Joi.string().required(),
  coinName: Joi.string().required(),
  condition: Joi.string().valid('above', 'below').required(),
  targetPrice: Joi.number().positive().required(),
});

export const portfolioPositionSchema = Joi.object({
  coinId: Joi.string().required(),
  coinName: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  purchasePrice: Joi.number().positive().required(),
});

export async function validate(schema: Joi.Schema, data: any): Promise<any> {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(
      error.details.map((d) => d.message).join(', ')
    );
  }
  return value;
}
