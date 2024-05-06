const usersSchema = {
  name: String,
  email: String,
  password: String,
};

const transaction = {
  product: String,
  price: Number,
  amount: Number,
}

module.exports = {usersSchema, transaction};
