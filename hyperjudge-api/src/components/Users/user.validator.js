const { z } = require('zod');

const registerSchema = {
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6),
  }),
};

const loginSchema = {
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};
