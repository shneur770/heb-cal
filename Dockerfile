FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN VITE_BASE=/ npx vite build
RUN npm install -g serve
EXPOSE 8770
CMD ["serve", "-s", "dist", "-l", "8770"]
