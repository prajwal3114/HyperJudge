const prisma = require('../../db/prisma/client');
const AppError = require('../../utils/AppError');
const crypto = require('crypto');

const createSubmission = async (userId, data, idempotencyKey) => {
  // Verify problem exists and is PUBLISHED
  const problem = await prisma.problem.findUnique({
    where: { id: data.problemId },
  });

  if (!problem || problem.status !== 'PUBLISHED') {
    throw new AppError('Problem not found or not published', 404);
  }

  // Idempotency check handled by Prisma unique constraint (user_id, idempotency_key)
  // If unique constraint fails, Prisma will throw P2002 and our error handler catches it (409)

  const transaction = await prisma.$transaction(async (tx) => {
    // 1. Create Submission
    const submission = await tx.submission.create({
      data: {
        user_id: userId,
        problem_id: data.problemId,
        language: data.language,
        source_code: data.sourceCode,
        status: 'QUEUED', // As per spec
        idempotency_key: idempotencyKey,
      },
    });

    // 2. Create OutboxEvent
    await tx.outboxEvent.create({
      data: {
        aggregate_id: submission.id,
        aggregate_type: 'Submission',
        event_type: 'SubmissionCreated',
        payload: {
          submissionId: submission.id,
          problemId: problem.id,
          language: submission.language,
          sourceCode: submission.source_code,
          timeLimit: problem.time_limit_ms,
          memoryLimit: problem.memory_limit_mb,
        },
        status: 'PENDING',
      },
    });

    return submission;
  });

  return transaction;
};

const getSubmissions = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        problem_id: true,
        status: true,
        tests_passed: true,
        tests_total: true,
        execution_time_ms: true,
        memory_used_kb: true,
        created_at: true,
        problem: { select: { slug: true, title: true } },
      }
    }),
    prisma.submission.count({ where: { user_id: userId } }),
  ]);

  return { submissions, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getSubmissionById = async (id, user) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      problem: { select: { slug: true, title: true } },
      test_case_results: {
        select: {
          id: true,
          status: true,
          execution_time_ms: true,
          memory_used_kb: true,
          // Hide exact stdout/stderr unless it's a specific user requirement, 
          // but we follow "Do not expose hidden test cases" rule.
          // By default, just status and metrics.
        }
      }
    }
  });

  if (!submission) throw new AppError('Submission not found', 404);

  if (submission.user_id !== user.id && user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to view this submission', 403);
  }

  // Hide source code or other internals if necessary, but owner/admin can see it.
  return submission;
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
};
