class AppError extends Error {
  constructor({ message, code, status, details }) {
    super(message);
    this.name = 'AppError';
    this.code = code || 'APP_ERROR';
    this.status = status || 500;
    this.details = details || null;
  }
}

module.exports = { AppError };
