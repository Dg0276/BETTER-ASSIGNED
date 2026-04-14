FROM python:3.9-slim

WORKDIR /app

# Install postgres client dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application using gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]
