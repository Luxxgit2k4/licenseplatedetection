FROM python:3.10.6

COPY main.py /app/main.py
COPY model /app/model
COPY requirements.txt /app/requirements.txt

# Set the working director
WORKDIR /app

# Install dependencies, including graphics libraries
RUN apt-get update && \
apt-get install -y libgl1-mesa-glx

RUN pip install -r requirements.txt

# Install dependencies for OpenCV and X11 (for GUI forwarding)
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    libx11-dev \
    libgl1-mesa-glx \
    libgtk2.0-dev \
    libcanberra-gtk-module \
    libcanberra-gtk3-module

# Copy your Python script into the container
# RUN apt-get update && \

# Run your Python script

# uvicorn main:luffy --reload
CMD ["uvicorn", "main:luffy", "--reload"]
