FROM python:3.10.6

# Set the working director
WORKDIR /app

# Install dependencies for OpenCV and X11 (for GUI forwarding)
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    libx11-dev \
    libgl1-mesa-glx \
    libgtk2.0-dev \
    libcanberra-gtk-module \
    libcanberra-gtk3-module

# Install dependencies, including graphics libraries
RUN apt-get update && \
apt-get install -y libgl1-mesa-glx

COPY requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

# Copy your Python script into the container
# RUN apt-get update && \

# Run your Python script

COPY model /app/model
COPY main.py /app/main.py
COPY .env /app/.env

# RUN --mount=type=secret,id=myenv,dst=/app/.env cat /app/.env
# RUN cat /app/.env

# uvicorn main:luffy --reload
# uvicorn main:luffy --host 0.0.0.0 --port 8000 --reload
CMD ["uvicorn", "main:luffy","--host", "0.0.0.0", "--port", "8000", "--reload"]
