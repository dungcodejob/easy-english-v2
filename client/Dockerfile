FROM --platform=linux/amd64 node:20-bullseye


WORKDIR /app

COPY package*.json ./
RUN npm install --include=optional

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve","-s","dist","-l","3000"]