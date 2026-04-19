FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Production environment
ENV NODE_ENV=production
ENV PORT=8080
ENV LOCUS_API_KEY=claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU
ENV LOCUS_API_BASE=https://beta-api.paywithlocus.com
ENV USE_DUMMY=false
ENV FRONTEND_URL=*

EXPOSE 8080

CMD ["node", "server.js"]
