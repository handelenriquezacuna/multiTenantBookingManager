FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; \
    elif [ -f pyproject.toml ]; then pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml || true; \
    fi

EXPOSE 8000

CMD ["sh", "-c", "if [ -f app/main.py ]; then uvicorn app.main:app --host 0.0.0.0 --port 8000; else echo 'API app not initialized'; tail -f /dev/null; fi"]
