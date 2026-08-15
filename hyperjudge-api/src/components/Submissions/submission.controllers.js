const asyncHandler = require('../../utils/asyncHandler');
const submissionService = require('./submission.services');

const createSubmission = asyncHandler(async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  const submission = await submissionService.createSubmission(req.user.id, req.body, idempotencyKey);

  res.status(202).json({
    status: 'success',
    data: { submission },
  });
});

const getSubmissions = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await submissionService.getSubmissions(req.user.id, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmissionById(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    data: { submission },
  });
});

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
};
