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

### Plain old JSON
```http
POST /persons HTTP/1.1

{
  "title": "my title",
  "firstName": "Johan",
  "lastName": "LE LAN",
  "town": "San Francisco",
  "state": "California"
}
```
Should create a new table named `persons`.
```sql
create table `persons` (
  `_id` varchar(255) not null primary key, 
  `title` varchar(255), 
  `firstName` varchar(255), 
  `lastName` varchar(255), 
  `town` varchar(255), 
  `state` varchar(255), 
  `created_at` datetime, 
  `updated_at` datetime
);
```
Should insert a record into this table.
```sql
select * from persons;
```

| _id | title | firstName | lastName | town | state |
|----------|----------|-----------|----------|---------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California |

### Additional properties
```http
POST /persons HTTP/1.1

{
  "title": "second title",
  "age": 35,
  "isBeautiful": true
}
```
Should alter the table `persons` and add two columns [`age`, `isBeautiful`]
```sql
alter table `persons` add `age` integer, add `isBeautiful` boolean;
```
Should insert a record into this table.
```sql
select * from persons;
```

| _id | title | firstName | lastName | town | state | age | isBeautiful |
|----------|----------|-----------|----------|---------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | | | | | 35 | 1 |


### Nested property
```http
POST /persons HTTP/1.1

{
  "title": "third one",
  "nested": {
    "label": "aSentence",
    "date": "2016-05-06T15:28:13",
    "zipCode": 23456
  }
}
```
Should alter the table `persons` and add a new column `nested`.
```sql
alter table `persons` add `nested` varchar(255);
```
Should insert a record into this table.
```sql
select * from persons;
```

| _id | title | firstName | lastName | town | state | age | isBeautiful | nested |
|----------|----------|-----------|----------|---------------|------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California | | | | |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | | | | | 35 | 1 | |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | third one | | | | | | | 0c292041-47db-43f8-8106-da00652e9260 |


### Multi-valued property
```json
{
  "title": "",
  "multi": [
    {"title": "myTitle", "flag": false},
    {"title": "anotherTitle", "flag": true}
  ]
}
```
