const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');

// Object to store login attempts and timestamps
const loginAttempts = {};

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    // Reset login attempts after successful login
    delete loginAttempts[email];
    
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  // Increment login attempt count
  if (!loginAttempts[email]) {
    loginAttempts[email] = {
      attempts: 1,
      lastAttemptAt: new Date(),
    };
  } else {
    const { attempts, lastAttemptAt } = loginAttempts[email];
    const now = new Date();
    
    if (now - lastAttemptAt < 30 * 60 * 1000) {
      loginAttempts[email].attempts++;
    } else {
      // Reset login attempts if more than 30 minutes have passed
      loginAttempts[email] = {
        attempts: 1,
        lastAttemptAt: now,
      };
    }

    // If attempts exceed 5, throw error
    if (loginAttempts[email].attempts >= 5) {
      // Calculate time left until reset
      const remainingTime = Math.ceil((lastAttemptAt.getTime() + (30 * 60 * 1000) - now.getTime()) / 1000); // in seconds
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `Too many failed login attempts. Try again in ${Math.ceil(remainingTime / 60)} minutes.`
      );
    }
  }

  return null;
}

module.exports = {
  checkLoginCredentials,
};