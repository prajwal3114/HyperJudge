const { z } = require('zod');

const createSubmissionSchema = {
  body: z.object({
    problemId: z.string().uuid(),
    language: z.enum(['cpp', 'c', 'java', 'python']),
    sourceCode: z.string().min(1, 'Source code cannot be empty').max(100_000, 'Source code is too large'),
  }),
};

const getSubmissionsSchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
};

module.exports = {
  createSubmissionSchema,
  getSubmissionsSchema,
};