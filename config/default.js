module.exports = {
  APP_PORT: process.env.APP_PORT || 3000,
  serviceName: 'data-repository',
  expositionPath: process.env.EXPOSITION_PATH || '/',
  admin: {
    userName: (process.env.ADMIN_USERNAME || 'admin'),
    password: (process.env.ADMIN_PASSWORD || 'admin')
  },
  db : {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: process.env.DB_CONNECTION || {
      filename: './data-repository.sqlite'
    },
    useNullAsDefault: true
  },
  constants: {
    tableIdentifierColumnName: process.env.COLUMN_ID_NAME || '_id',
    foreignColumnName: process.env.COLUMN_FOREIGN_ID_NAME || '_foreignId'
  },
  log: {
    options: {
      transports: {
        console: {
          type: 'Console',
          level: process.env.LOG_LEVEL || 'debug',
          colorize: true,
          prettyPrint: false
        },
        consoleInfo: {
          type: 'Console',
          level: 'info',
          colorize: true,
          prettyPrint: false
        },
        consoleError: {
          type: 'Console',
          level: 'error',
          colorize: true,
          prettyPrint: false
        },
        file: {
          type: 'DailyRotateFile',
          level: 'error',
          filename: 'data-repository.log',
          prettyPrint: true,
          json: false,
          colorize: true
        }
      },
      loggers: {
        default: ['consoleInfo']
      }
    }
  }
};
