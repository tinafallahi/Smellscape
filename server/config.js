var DEBUG = true;

exports.db_client = 'pg';
exports.db_url = process.env.DATABASE_URL || 'postgresql://localhost/smellscape';
exports.DEBUG = DEBUG;
exports.SQL_DEBUG = false;

exports.awskeys = function() {
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET
}

exports.knex_options = {
  client: exports.db_client,
  connection: exports.db_url,
  debug: exports.SQL_DEBUG
};

exports.debug = function() {
  if (DEBUG) {
    console.log.apply(console, ["[debug]"].concat(Array.prototype.slice.call(arguments, 0)));
  }
};

exports.info = function() {
  if (DEBUG) {
    console.log.apply(console, ["[info]"].concat(Array.prototype.slice.call(arguments, 0)));
  }
};

exports.warn = function() {
  console.log.apply(console, ["[WARN]"].concat(Array.prototype.slice.call(arguments, 0)));
};

exports.error = function() {
  console.log.apply(console, ["[ERROR]"].concat(Array.prototype.slice.call(arguments, 0)));
};