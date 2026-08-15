const express = require('express');
const userController = require('./user.controllers');
const { registerSchema, loginSchema } = require('./user.validator');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/me', requireAuth, userController.getMe);

module.exports = router;
