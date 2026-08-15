const prisma = require('../../db/prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ id }, env.jwt.secret, {
    expiresIn: '90d',
  });
};

const registerUser = async (username, password) => {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new AppError('Username is already taken', 409);
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      username,
      password_hash,
    },
  });

  const token = signToken(user.id);
  
  // Omit password hash
  const { password_hash: _ph, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Incorrect username or password', 401);
  }

  const token = signToken(user.id);
  
  const { password_hash: _ph, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const getUserProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { password_hash: _ph, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
