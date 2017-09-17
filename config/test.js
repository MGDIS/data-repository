module.exports = {
  APP_PORT: process.env.APP_PORT || 3333,
  db: {
    client: 'sqlite3',
    connection: {
      filename: './test/data-repository.sqlite'
    },
    useNullAsDefault: true
  }
};