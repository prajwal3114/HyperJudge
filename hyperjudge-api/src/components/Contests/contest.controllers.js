const asyncHandler = require('../../utils/asyncHandler');
const contestService = require('./contest.services');

const createContest = asyncHandler(async (req, res) => {
  const contest = await contestService.createContest(req.body);

  res.status(201).json({
    status: 'success',
    data: { contest },
  });
});

const getContests = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await contestService.getContests(page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getContestById = asyncHandler(async (req, res) => {
  const contest = await contestService.getContestById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { contest },
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await contestService.getLeaderboard(req.params.id, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  createContest,
  getContests,
  getContestById,
  getLeaderboard,
};
