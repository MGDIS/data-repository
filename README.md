# DATA REPOSITORY

A simple service that saves JSON object from HTTP to SQL92 relational databases.

## Resume

Based on [Knexjs](https://github.com/tgriesser/knex) and [ExpressJS](http://expressjs.com/), this service saves `every` JSON object into SQL92 relational databases. It supports MySQL, PostgreSQL, Sqlite3, MSSQL and Oracle.

## Installation

First you need to **clone this repository**.
Then you must install the service's dependencies.
```sh
git clone https://github.com/MGDIS/data-repository.git
cd data-repository
npm install
```

## Test

This service comes with a mocha test suite. Run tests with this command :
```sh
npm test
```

### Coverage and code analysis

If you want a report on code statistics, feel free to run `cibuild` command :
```sh
npm run-script cibuild
```

## Documentation

Available documentation is in the [wiki](https://github.com/MGDIS/data-repository/wiki).


## JSON to SQL

It will save JSON's map to named table and array to external table with foreign keys. 
It supports alter table when a new property is detected in existing table.
**It does not support dropping property from existing table**
[Follow the wiki to understand basic mapping](https://github.com/MGDIS/data-repository/wiki/JSON2SQL)
