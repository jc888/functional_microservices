# Functional_microservices

Examples of building a microservices application in a functional manner.


### Requirements

RabbitMQ

```
docker run -d -p 5672:5672 -p 15672:15672  --name rabbitmq rabbitmq
docker run --name redis -p 6379:6379 -d redis
docker run --name mongo -p 27017:27017 -d mongo
```