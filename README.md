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

    $ npm install


Run
---

__Start the server:__

    $ npm start

*__NOTE:__ This command will only start the Express server, not the MongoDB instance (see below).*

Set the environment variable `DBWEBB_PORT` to the port the server should listen on (defaults to 1337). 
To see the resulting website in action, browse to the server's address including the aforementioned port (typically *http://localhost:1337*). 

After stopping the server with Ctrl+C under Cygwin the Node process remains running in memory, blocking the chosen port. 
A batch file is provided to facilitate restarting the server after this has happened:

    $ ./restart.bat

The command `npm stop` will simply kill the errant Node processes, without restarting the server (also Cygwin-only).

__Run MongoDB using Docker:__

    $ docker-compose up mongodb

This starts a MongoDB container in the foreground, allowing log messages to be seen, accepting connections on port 27017. 
Use the environment variable `DBWEBB_DSN` to change the connection string the Express server uses to talk to the MongoDB instance.

__Start the server with MongoDB using Docker:__

    $ docker-compose up -d

*or*

    $ npm run start-docker

This starts both the Express server and the MongoDB server in separate containers in the background, using default configurations. 
Stop all running containers with `docker-compose down` or `npm run stop-docker`.

The old containers with different versions of Node have been moved to the file *docker-compose-old.yml*.


Test
----

__Run linters:__

    $ npm run lint

__Run unit tests:__

    $ npm run tap

A code coverage report in HTML format is saved in *build/coverage*. To get a Clover report instead, run `npm run tap-clover`.

__Run full test sequence:__

    $ npm test

This includes both linters and unit tests.

__Run test sequence with different versions of Node using Docker:__

    $ npm run test1     # latest Node
    $ npm run test2     # Node 8
    $ npm run test3     # Node 4


---


/ [LRC](mailto:kabc16@student.bth.se)
