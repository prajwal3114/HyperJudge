const express = require('express');
const contestController = require('./contest.controllers');
const { createContestSchema, getContestsSchema, getLeaderboardSchema } = require('./contest.validator');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', validate(getContestsSchema), contestController.getContests);
router.get('/:id', contestController.getContestById);
router.get('/:id/leaderboard', validate(getLeaderboardSchema), contestController.getLeaderboard);

router.use(requireAuth);
router.post('/', requireRole('ADMIN'), validate(createContestSchema), contestController.createContest);

module.exports = router;
