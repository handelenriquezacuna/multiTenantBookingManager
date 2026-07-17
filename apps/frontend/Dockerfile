FROM node:22-alpine

WORKDIR /app

COPY . .

RUN corepack enable

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# they must be ARG/ENV before `pnpm build` runs (setting them only at
# `docker run` time has no effect on an already-built .next output).
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_API_MODE=mock
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_MODE=${NEXT_PUBLIC_API_MODE}

RUN if [ -f package.json ]; then \
      pnpm install --frozen-lockfile || pnpm install; \
      pnpm build || true; \
    fi

EXPOSE 3000

CMD ["sh", "-c", "if [ -f package.json ]; then pnpm start; else echo 'Frontend app not initialized'; tail -f /dev/null; fi"]
