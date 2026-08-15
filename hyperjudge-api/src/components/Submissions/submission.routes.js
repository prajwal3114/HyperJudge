const express = require('express');
const submissionController = require('./submission.controllers');
const { createSubmissionSchema, getSubmissionsSchema } = require('./submission.validator');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(createSubmissionSchema), submissionController.createSubmission);
router.get('/', validate(getSubmissionsSchema), submissionController.getSubmissions);
router.get('/:id', submissionController.getSubmissionById);

module.exports = router;
