FROM node:22-alpine

WORKDIR /src

RUN apk update && apk upgrade

RUN apk add git

RUN apk add perl perl-dev

COPY ./cicd.js ./

COPY ./iscreated.json ./

EXPOSE 3000

ENTRYPOINT [ "node", "cicd.js" ]

