module.exports = {
  db: {
    client: 'sqlite3',
    connection: {
      filename: './test/data-repository.sqlite'
    },
    useNullAsDefault: true
  }
};