# smally

## Short Description
This is a small URL shortener backend project.

## Functionality
 - The use of it is very simple - submit a long link - and get back a shorter one;
 - Then, when clicking on a short link - be redirected to a long one. 

## Techniques And Libraries
For this project were used:  
- Nest.js;
- Typescript;
- MySql;
- Redis;
- Sequelize;
- ioredis;
- REST;
- jest;
- supertest;
- docker;
- eslint.

## Architecture
The project has a server, where all requests are being sent. There are interceptors, which work as a logger:
There are filters, which catch and style server errors.
Database is used through Sequelize ORM.  
Redis is used for caching, if the link exists in Redis, than we take it from there and not from a database.  

So the structure looks like this:  
request -> Interceptor -> Route Handler -> Redis            -> Interceptor -> Filter -> response
                                        -> Database (mysql)  
The project also has docker-compose file to run easily database and Redis.

## Structure
The project has a standart structure, where /src folder has typescript code and /dist has compiled code. All the source code files have .ts extension and test files lie beside them with same name and .spec.ts extensions. 

## Tests  
Whole project is covered by tests and two existing endpoints are being checked using e2e tests.

## Scaling
To design a Url shortener service of a big scale a good idea would be to use multiple servers
for different continents, for minimum latency. It would be also useful to add cache for often
accessed links. Creation of unique Url should be executed beforehand, so when user generates link -
we give him existing url. This way the request processes faster, than it would otherwise. We can use
numbers and upper and lowecase letters to generate url. Assume, url length is 7, than we have more
than 3500 billion combinations. We can use counter to keep track of already generated links. Than
we change counter to base62 – and that is how we get url. When counter reaches maximum - just
set it to 0.    

Let's assume we have 10,000 generate requests and a record approximately takes up to 2000
bytes(including all fields) => 1.7 TB a day. Each day more and more urls will be generated. So, we
need to use database, which can scale easily and also perform fast read and write. That is why I
would use one of NoSQL dbs, not MySql, which was used in the prorotype. One of possible
solutions is MongoDB. It stores data in json-like format, so it would be easy to store documents
(shortUrl, originalUrl, createDate, updateDate, clicks etc). Each day takes up ~860 million of url
combinations, which means we need to delete some records in under 4069 days. But we also need
to remember about limited size of the database. Although it would be better to keep even unclicked
links alive for at least 2 months, if we have limited space, we can delete least clicked links every 2
days (but will it be a good user experience, that is the question).

## Author
[Gorbunova Yelyzaveta](https://github.com/lizardlynx)
