FROM node:8.9-slim

ADD . /usr/app
WORKDIR /usr/app

RUN npm install -g --silent sequelize \
  && npm install --slient

EXPOSE 3000

CMD ["npm", "start"]