[BTH] ramverk2
==============

[![Travis CI Build Status](https://travis-ci.org/lrc-se/bth-ramverk2.svg?branch=master)](https://travis-ci.org/lrc-se/bth-ramverk2)
[![Scrutinizer Build Status](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/badges/build.png?b=master)](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/build-status/master)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/?branch=master)
[![Scrutinizer Code Coverage](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/lrc-se/bth-ramverk2/?branch=master)

This is the base repo for the course *ramverk2* in BTH's web development programme, containing a simple [Express](http://expressjs.com/) server application.


Setup
-----

Before doing *anything* else, set up the environment:

`npm install`


Run
---

__Start the server:__

`npm start`

Set the environment variable `DBWEBB_PORT` to the port the server should listen on (defaults to 1337).

After stopping the server with Ctrl+C under Cygwin the Node process remains running in memory, blocking the chosen port. 
A batch file is provided to facilitate restarting the server after this has happened:

`./restart.bat`

The command `npm stop` will simply kill the errant Node processes, without restarting the server.

__Run MongoDB using Docker:__

`docker-compose up mongodb`

This starts the MongoDB container in the foreground, allowing log messages to be seen, accepting connections on port 27017. 
Use the environment variable `DBWEBB_DSN` to change the connection string the Express server uses to talk to the MongoDB instance.

`docker-compose up -d`

This starts both the Express server and the MongoDB server in separate containers in the background, using default configurations. 
Stop all running containers with `docker-compose down`.

The old containers with different versions of Node have been moved to the file *docker-compose-old.yml*.


Test
----

__Run linters:__

`npm run lint`

__Run unit tests:__

`npm run tap`

A code coverage report is saved in *build/coverage*.

__Run full test sequence:__

`npm test`

This includes both linters and unit tests.

__Run test sequence with different versions of Node using Docker:__

```
npm run test1   # latest Node
npm run test2   # Node 8
npm run test3   # Node 4
```


---


/ [LRC](mailto:kabc16@student.bth.se)
