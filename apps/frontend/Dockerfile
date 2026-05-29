FROM node:20-alpine

WORKDIR /app

COPY . .

RUN corepack enable

RUN if [ -f package.json ]; then \
      pnpm install --frozen-lockfile || pnpm install; \
      pnpm build || true; \
    fi

EXPOSE 3000

CMD ["sh", "-c", "if [ -f package.json ]; then pnpm start; else echo 'Frontend app not initialized'; tail -f /dev/null; fi"]
