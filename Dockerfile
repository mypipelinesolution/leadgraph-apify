FROM apify/actor-node-playwright-chrome:20

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create symlinks for python and pip
RUN ln -s /usr/bin/python3 /usr/bin/python \
    && ln -s /usr/bin/pip3 /usr/bin/pip

# Install Crawl4AI and dependencies
RUN pip install --no-cache-dir \
    crawl4ai \
    playwright \
    && python -m playwright install chromium \
    && python -m playwright install-deps chromium

COPY package*.json ./

RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && echo "Python version:" \
    && python --version

COPY . ./
