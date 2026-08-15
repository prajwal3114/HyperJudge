const { z } = require('zod');

const createContestSchema = {
  body: z.object({
    title: z.string().min(3).max(255),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    status: z.string().default('UPCOMING'),
  }).refine(data => new Date(data.end_time) > new Date(data.start_time), {
    message: "end_time must be after start_time",
    path: ["end_time"],
  }),
};

const getContestsSchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
};

const getLeaderboardSchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
};

module.exports = {
  createContestSchema,
  getContestsSchema,
  getLeaderboardSchema,
};
