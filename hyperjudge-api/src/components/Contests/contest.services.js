const prisma = require('../../db/prisma/client');
const AppError = require('../../utils/AppError');

const createContest = async (data) => {
  return await prisma.contest.create({ data });
};

const getContests = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [contests, total] = await Promise.all([
    prisma.contest.findMany({
      skip,
      take: limit,
      orderBy: { start_time: 'desc' },
    }),
    prisma.contest.count(),
  ]);

  return { contests, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getContestById = async (id) => {
  const contest = await prisma.contest.findUnique({
    where: { id },
  });

  if (!contest) throw new AppError('Contest not found', 404);

  return contest;
};

const getLeaderboard = async (contestId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [leaderboard, total] = await Promise.all([
    prisma.leaderboard.findMany({
      where: { contest_id: contestId },
      skip,
      take: limit,
      orderBy: [
        { score: 'desc' },
        { penalty_time: 'asc' }
      ],
      include: {
        user: { select: { username: true } },
      }
    }),
    prisma.leaderboard.count({ where: { contest_id: contestId } }),
  ]);

  return { leaderboard, total, page, limit, totalPages: Math.ceil(total / limit) };
};

module.exports = {
  createContest,
  getContests,
  getContestById,
  getLeaderboard,
};
