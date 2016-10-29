# Functional_microservices

Examples of building a microservices application in a functional manner.

### Requirements

Docker


```
docker run --name redis -p 6379:6379 -d redis
docker run --name mongo -p 27017:27017 -d mongo
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -d elasticsearch
```