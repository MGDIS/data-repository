# DATA REPOSITORY

A simple service that save JSON object from HTTP request into SQL92 relational databases.

## Installation

```sh
npm install
```

## Resume

Based on the flexible SQL query builder [Knexjs](https://github.com/tgriesser/knex), this [ExpressJS](http://expressjs.com/) service save every JSON object into SQL92 relational databases. It supports MySQL, PostgreSQL, Sqlite3 and Oracle.

## Basic rules

It will save JSON's map to named table and array to external table with foreign keys. 
It suports alter table when a new property is detected in existing table. 
**It does not support dropping property from existing table**
