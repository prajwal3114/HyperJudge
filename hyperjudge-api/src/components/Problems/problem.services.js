const prisma = require('../../db/prisma/client');
const AppError = require('../../utils/AppError');

const getProblems = async (userRole, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  // Users see only PUBLISHED, Admins see all
  const where = userRole === 'ADMIN' ? {} : { status: 'PUBLISHED' };

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        time_limit_ms: true,
        memory_limit_mb: true,
        status: true,
        created_at: true,
        author: { select: { username: true } },
      }
    }),
    prisma.problem.count({ where }),
  ]);

  return { problems, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getProblemBySlug = async (slug, userRole) => {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true } },
      test_cases: {
        select: {
          id: true,
          sequence_number: true,
          is_hidden: true,
          // Conditionally include input/output only if admin, but Prisma doesn't support conditional selects easily.
          // We will filter it in JS.
          input_data: true,
          expected_output: true,
        },
        orderBy: { sequence_number: 'asc' }
      }
    }
  });

  if (!problem) throw new AppError('Problem not found', 404);

  if (problem.status !== 'PUBLISHED' && userRole !== 'ADMIN') {
    throw new AppError('Problem not found', 404);
  }

  // Hide hidden testcase data from normal users
  if (userRole !== 'ADMIN') {
    problem.test_cases = problem.test_cases.map(tc => {
      if (tc.is_hidden) {
        return {
          id: tc.id,
          sequence_number: tc.sequence_number,
          is_hidden: true,
        }; // Exclude input_data and expected_output
      }
      return tc;
    });
  }

  return problem;
};

const createProblem = async (data, authorId) => {
  return await prisma.problem.create({
    data: {
      ...data,
      author_id: authorId,
    },
  });
};

const updateProblem = async (id, data, user) => {
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) throw new AppError('Problem not found', 404);

  if (user.role !== 'ADMIN' && problem.author_id !== user.id) {
    throw new AppError('You do not have permission to edit this problem', 403);
  }

  return await prisma.problem.update({
    where: { id },
    data,
  });
};

const addTestCase = async (problemId, data) => {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new AppError('Problem not found', 404);

  return await prisma.testCase.create({
    data: {
      ...data,
      problem_id: problemId,
    },
  });
};

module.exports = {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  addTestCase,
};
