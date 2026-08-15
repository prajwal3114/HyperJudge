const { z } = require('zod');

const problemStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

const createProblemSchema = {
  body: z.object({
    slug: z.string().min(3).max(100),
    title: z.string().min(3).max(255),
    time_limit_ms: z.number().int().positive().max(10000), // Max 10s
    memory_limit_mb: z.number().int().positive().max(1024), // Max 1GB
    status: problemStatusEnum.default('DRAFT'),
  }),
};

const updateProblemSchema = {
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    time_limit_ms: z.number().int().positive().max(10000).optional(),
    memory_limit_mb: z.number().int().positive().max(1024).optional(),
    status: problemStatusEnum.optional(),
  }),
};

const addTestCaseSchema = {
  body: z.object({
    input_data: z.string(),
    expected_output: z.string(),
    is_hidden: z.boolean().default(false),
    sequence_number: z.number().int().nonnegative(),
  }),
};

const getProblemsSchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
};

module.exports = {
  createProblemSchema,
  updateProblemSchema,
  addTestCaseSchema,
  getProblemsSchema,
};
