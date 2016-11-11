# Functional_microservices

Examples of building a microservices application in a functional manner.

### Requirements

Docker


```
# bring up the containers
docker-compose up -d

# shell into the nodejs container
docker exec -ti app /bin/bash

# install
npm install

# seed with data
npm run seed

# start the webservice
npm start

# example endpoint
http://localhost:8080/?q=functional

```