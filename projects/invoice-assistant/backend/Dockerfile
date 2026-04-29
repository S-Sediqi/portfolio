# Dockerfile — AI Invoice Assistant backend
# Defines the container image for the Flask API

# Start from the official Python 3.11 slim image
# slim = smaller image, only what Python needs, no extras
FROM python:3.11-slim

# Set the working directory inside the container
# All subsequent commands run from this path
WORKDIR /app

# Copy requirements first — before copying the rest of the code
# Docker caches each step. If requirements.txt hasn't changed,
# Docker skips the pip install step on rebuilds — much faster
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir keeps the image smaller
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application code
COPY . .

# Tell Docker this container listens on port 5001
EXPOSE 5001

# The command that runs when the container starts
# Uses Python to run app.py directly
CMD ["python", "app.py"]