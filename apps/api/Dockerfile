FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY app ./app

# Install the Microsoft ODBC Driver 18 for SQL Server (msodbcsql18) + unixodbc,
# plus the build toolchain pyodbc needs to compile against unixodbc headers.
# The build-only packages (gcc/g++/curl/gnupg2/unixodbc-dev) are purged again
# once the project is installed so the runtime image only keeps what it
# actually needs to run (msodbcsql18 + unixodbc runtime libs).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gnupg2 \
        apt-transport-https \
        ca-certificates \
        gcc \
        g++ \
        unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list -o /etc/apt/sources.list.d/mssql-release.list \
    && sed -i 's#deb \[arch=amd64,armhf,arm64\]#deb [arch=amd64,armhf,arm64 signed-by=/usr/share/keyrings/microsoft-prod.gpg]#g' /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 unixodbc \
    && pip install --no-cache-dir . \
    && apt-get purge -y --auto-remove curl gnupg2 apt-transport-https gcc g++ unixodbc-dev \
    && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
