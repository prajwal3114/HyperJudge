const AppError = require('../utils/AppError');
const env = require('../config/env');

const handleZodError = (err) => {
  const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return new AppError(`Validation Error: ${message}`, 400);
};

const handlePrismaError = (err) => {
  // Common Prisma errors like P2002 Unique constraint failed
  if (err.code === 'P2002') {
    const fields = err.meta?.target || 'unknown field';
    return new AppError(`Duplicate field value entered on ${fields}. Please use another value!`, 409);
  }
  return new AppError('Database Error', 500);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.env === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err, { message: err.message });
    
    if (error.name === 'ZodError') error = handleZodError(error);
    if (error.name === 'PrismaClientKnownRequestError') error = handlePrismaError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
