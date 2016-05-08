# DATA REPOSITORY

A simple service that save JSON object from HTTP request into SQL92 relational databases.

## Resume

Based on the flexible SQL query builder [Knexjs](https://github.com/tgriesser/knex),
this [ExpressJS](http://expressjs.com/) service saves every JSON object into SQL92 relational databases.
It supports MySQL, PostgreSQL, Sqlite3 and Oracle.

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

## WEB API
This service expose only one endpoint `POST on /{kind}`.

```http
POST /{kind} HTTP/1.1
Content-Type: application/json

{
  // Your plain old JSON
  ...
}
```
> NOTE : kind will be use to create the table (if needed)

## JSON to SQL

It will save JSON's map to named table and array to external table with foreign keys. 
It supports alter table when a new property is detected in existing table.
**It does not support dropping property from existing table**

### Basic rules

#### Plain old JSON
```http
POST /persons HTTP/1.1

{
  "title": "my title",
  "firstName": "Johan",
  "lastName": "LE LAN",
  "city": "San Francisco",
  "state": "California"
}
```
Should create a new table named `persons`.
```sql
create table `persons` (
  `id` varchar(255) not null primary key, 
  `title` varchar(255), 
  `firstName` varchar(255), 
  `lastName` varchar(255), 
  `city` varchar(255), 
  `state` varchar(255), 
  `created_at` datetime, 
  `updated_at` datetime
);
```
Should insert a record into this table.
```sql
select * from persons;
```

| id | title | firstName | lastName | city | state |
|----------|----------|-----------|----------|---------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California |

#### Additional properties
```http
POST /persons HTTP/1.1

{
  "title": "second title",
  "firstName": "nahoj",
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

| id | title | firstName | lastName | city | state | age | isBeautiful |
|----------|----------|-----------|----------|---------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | nahoj | | | | 35 | 1 |

### Nested property
```http
POST /persons HTTP/1.1

{
  "title": "third one",
  "nested": {
    "label": "a sentence",
    "date": "2016-05-06T15:28:13Z",
    "zipCode": 23456
  }
}
```
Should alter the table `persons` and add a new column `nested`.
```sql
alter table `persons` add `nested` varchar(255);
```
Should create a nested table `persons_nested`.
```sql
create table `persons_nested` (
  `id` varchar(255) not null primary key, 
  `label` varchar(255), 
  `date` varchar(255), 
  `zipCode` varchar(255),
  `created_at` datetime, 
  `updated_at` datetime
);
```
This new table should contain a record.
```sql
select * from persons_nested;
```

| id | label | date | zipCode |
|----------|----------|-----------|----------|
| **0c292041-47db-43f8-8106-da00652e9260** | a sentence | 2016-05-06T15:28:13Z | 23456 |

Should insert a record into this table.
```sql
select * from persons;
```

| id | title | firstName | lastName | city | state | age | isBeautiful | nested |
|----------|----------|-----------|----------|---------------|------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California | | | | |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | nahoj | | | | 35 | 1 | |
| da89687d-9304-4934-845f-8ea36bd420be | third one | | | | | | | **0c292041-47db-43f8-8106-da00652e9260** |

#### Multi-valued property
Two cases will be covered by this behavior. First a property multi-valued with nested objects. Second a multi-valued property with primive types.

##### Multi-valued objects property
```http
POST /persons HTTP/1.1

{
  "title": "I have a many friends",
  "firstName": "jll",
  "friends": [
    {"title": "my title", "flag": false},
    {"title": "another title", "flag": true}
  ]
}
```
Should create a new table `persons_friends` which contain the values of `friends` property.
```sql
create table `persons_friends` (
  `id` varchar(255) not null primary key, 
  `foreignId` varchar(255) FOREIGN KEY REFERENCES persons(id), 
  `title` varchar(255), 
  `flag` varchar(255), 
  `created_at` datetime, 
  `updated_at` datetime
);
```
This new table should contain all the values of `friends` property.
```sql
select * from persons_friends;
```

| id | foreignId | title | flag |
|----------|----------|-----------|----------|
| 96393e06-3739-42f4-a598-461646173a06 | **85aa59a8-0411-4275-8f8d-f5d30c0891f4** | my title | 0 |
| 8200aa4d-15a1-4f84-822a-b68d2d224675 | **85aa59a8-0411-4275-8f8d-f5d30c0891f4** | another title | 1 |

Should insert a record into this table.
```sql
select * from persons;
```

| id | title | firstName | lastName | city | state | age | isBeautiful | nested |
|----------|----------|-----------|----------|---------------|------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California | | | | |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | nahoj | | | | 35 | 1 | |
| da89687d-9304-4934-845f-8ea36bd420be | third one | | | | | | | 0c292041-47db-43f8-8106-da00652e9260 |
| **85aa59a8-0411-4275-8f8d-f5d30c0891f4** | I have many friends | jll | | | | | | |

##### Multi primitive values property
Imagine that your JSON contains a property with something like : 
```json
{
  "title": "primitive array",
  "tags": [
    "wonderful",
    "great"
  ]
}
```
In this case, the service will create a table named `persons_tags` with : 
 - an `id` column
 - a `foreignId` column
 - a `tags` column

```sql
create table `persons_tags` (
  `id` varchar(255) not null primary key, 
  `foreignId` varchar(255) FOREIGN KEY REFERENCES persons(id), 
  `tags` varchar(255), 
  `created_at` datetime, 
  `updated_at` datetime
);
```
 
This new table will contain two records:
```sql
select * from persons_tags;
```

| id | foreignId | tags |
|----------|----------|-----------|
| 81b66637-3072-446e-ab3f-65d5f0e4adf6 | **c2a7e3bf-de6f-4147-9926-aa482f28e72c** | wonderful |
| fb2bb8da-4f84-4843-9c84-f7836296a9c1 | **c2a7e3bf-de6f-4147-9926-aa482f28e72c** | great |

```sql
select * from persons;
```

| id | title | firstName | lastName | city | state | age | isBeautiful | nested |
|----------|----------|-----------|----------|---------------|------------|------------|------------|------------|
| ef1baa16-7d8c-4a06-94b5-7263d6472a4e | my title | Johan | LE LAN | San Francisco | California | | | | |
| bb0dc044-fbf1-426b-a05a-fbd2af72c7e5 | second title | nahoj | | | | 35 | 1 | |
| da89687d-9304-4934-845f-8ea36bd420be | third one | | | | | | | 0c292041-47db-43f8-8106-da00652e9260 |
| **c2a7e3bf-de6f-4147-9926-aa482f28e72c** | primitive array | | | | | | | |
