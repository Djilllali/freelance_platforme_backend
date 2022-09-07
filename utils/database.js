const MONGO_SECRET = process.env.MONGO_SECRET || "";

//const MONGO_URI = `mongodb+srv://turingjobs:${MONGO_SECRET}@turing-jobs.xspvfre.mongodb.net/?retryWrites=true&w=majority`;
const MONGO_URI = `mongodb+srv://agapornography:${MONGO_SECRET}@serverlessinstanceturin.dpqqc.mongodb.net/?retryWrites=true&w=majority
`;

module.exports = {
  MONGO_URI: MONGO_URI,
};
