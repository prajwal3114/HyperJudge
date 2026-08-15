const express = require('express');
const problemController = require('./problem.controllers');
const { createProblemSchema, updateProblemSchema, addTestCaseSchema, getProblemsSchema } = require('./problem.validator');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public/Optional Auth for reading problems (we use a custom middleware or just try to get user)
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (token) {
    const jwt = require('jsonwebtoken');
    const env = require('../../config/env');
    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      require('../../db/prisma/client').user.findUnique({ where: { id: decoded.id } }).then(user => {
        if(user) req.user = user;
        next();
      }).catch(err => next());
    } catch(err) {
      next();
    }
  } else {
    next();
  }
};

router.get('/', optionalAuth, validate(getProblemsSchema), problemController.getProblems);
router.get('/:slug', optionalAuth, problemController.getProblemBySlug);

// Protected routes (Admin / Problem Setters)
router.use(requireAuth);
router.post('/', requireRole('ADMIN'), validate(createProblemSchema), problemController.createProblem);
router.put('/:id', requireRole('ADMIN'), validate(updateProblemSchema), problemController.updateProblem);

// Test Cases (Admin only)
router.post('/:id/testcases', requireRole('ADMIN'), validate(addTestCaseSchema), problemController.addTestCase);

module.exports = router;
