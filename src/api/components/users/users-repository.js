const { User } = require('../../../models');

/**
 * Get total count of users matching search criteria
 * @param {object} search - Search filters
 * @returns {number} Total count of users
 */
async function getUsersCount(search) {
  return User.countDocuments(search);
}

/**
 * Get users with pagination and filtering
 * @param {number} skip - Number of documents to skip
 * @param {number} limit - Maximum number of documents to return
 * @param {object} sort - Sorting options
 * @param {object} search - Search filters
 * @returns {Array} Users data
 */
async function getUsersWithPagination(skip, limit, sort, search) {
  return User.find(search)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('id name email')
    .exec();
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getUsersCount,
  getUsersWithPagination,
};