const asyncHandler = require('../../utils/asyncHandler');
const problemService = require('./problem.services');

const getProblems = asyncHandler(async (req, res) => {
  const role = req.user ? req.user.role : 'USER';
  const { page, limit } = req.query;
  const result = await problemService.getProblems(role, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getProblemBySlug = asyncHandler(async (req, res) => {
  const role = req.user ? req.user.role : 'USER';
  const problem = await problemService.getProblemBySlug(req.params.slug, role);

  res.status(200).json({
    status: 'success',
    data: { problem },
  });
});

const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    data: { problem },
  });
});

const updateProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.updateProblem(req.params.id, req.body, req.user);

  res.status(200).json({
    status: 'success',
    data: { problem },
  });
});

const addTestCase = asyncHandler(async (req, res) => {
  const testCase = await problemService.addTestCase(req.params.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { testCase },
  });
});

module.exports = {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  addTestCase,
};
