module.exports = process.env.SPAM_COV
	? require('./lib-cov/spam')
	: require('./lib/spam');