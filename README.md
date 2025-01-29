# Pondlife

An open source, browser-based agent-based-modelling platform.

This is an early work-in-progress.

## Project setup

```bash
# clone the repo
$ git clone git@github.com:birophilo/pondlife.git
$ cd pondlife
```

### Frontend

```bash
$ npm install
$ npm run serve
```


### Backend API

```bash
# create and activate a virtual environment
$ cd api
$ python -m venv env
$ source env/bin/activate

#install requirements
$ pip install -r requirements.txt

# run as background process
$ ./api/run.sh -d
# ...or, open a new terminal window then run in foregound with:
$ ./api/run.sh
```

### MongoDB database

Install and run [Docker Desktop](https://www.docker.com), then from the root directory:

```bash
$ docker-compose up -d
```