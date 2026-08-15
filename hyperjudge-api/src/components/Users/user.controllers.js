const asyncHandler = require('../../utils/asyncHandler');
const userService = require('./user.services');

const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await userService.registerUser(username, password);
  
  res.status(201).json({
    status: 'success',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await userService.loginUser(username, password);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
