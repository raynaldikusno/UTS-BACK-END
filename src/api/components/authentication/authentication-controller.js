const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const failedLoginAttempts = {}; // Object to store failed login attempts

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check if there are previous failed login attempts
    if (failedLoginAttempts[email]) {
      // Check if the 30 minutes limit has passed since the last successful login
      const lastLoginTime = failedLoginAttempts[email].lastAttemptTime;
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (lastLoginTime < thirtyMinutesAgo) {
        // Reset failed login attempts counter
        failedLoginAttempts[email] = { attempts: 0 };
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Increment failed login attempts
      if (!failedLoginAttempts[email]) {
        failedLoginAttempts[email] = { attempts: 1, lastAttemptTime: new Date() };
      } else {
        failedLoginAttempts[email].attempts++;
        failedLoginAttempts[email].lastAttemptTime = new Date();
      }

      // Calculate time left until reset
      const lastAttemptTime = failedLoginAttempts[email].lastAttemptTime;
      const timeLeft = Math.ceil((30 * 60 * 1000 - (Date.now() - lastAttemptTime)) / 1000); // in seconds

      // Check if login attempts exceed limit
      if (failedLoginAttempts[email].attempts >= 5) {
        throw errorResponder(
          errorTypes.TOO_MANY_ATTEMPTS,
          `Too many failed login attempts. Try again in ${timeLeft} seconds.`
        );
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Clear failed login attempts upon successful login
    delete failedLoginAttempts[email];

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
