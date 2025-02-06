import logging
import sys
import threading
from io import BytesIO
import cv2
import easyocr
import numpy as np
import psycopg2
import uvicorn
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from dotenv import load_dotenv
from queue import Queue
import os
import time
import re

load_dotenv()
luffy = FastAPI()
#stopcamera = threading.Event()


# logger = logging.getLogger("uvicorn")
# logger.setLevel(logging.DEBUG)
# handler = logging.StreamHandler()
# handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s - %(remote_addr)s - %(request_method)s %(path)s %(status_code)s'))
# logger.addHandler(handler)
#
customlog = logging.getLogger("logs")
customlog.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
customlog.addHandler(handler)

# Placeholder: Initialize duplicate plates set and license plate validation
duplicateplates = set()

# event to control the capture loop
capture_event = threading.Event()
# global vidoe capture
cap = ""
# global frame queue
queue_size = os.getenv("FRAME_QUEUE_SIZE")
frame_queue = Queue(maxsize=int(queue_size or 20))
# cap.set(3, 640)
# cap.set(4, 480)

def formatplate(plate: str) -> str:
    cleaned = plate.replace(" ", "").upper()
    cleaned = re.sub(r"^[^A-Z0-9]*", "", cleaned)
    if len(cleaned) == 10:
        return f"{cleaned[0:2]} {cleaned[2:4]} {cleaned[4:6]} {cleaned[6:10]}"
    return cleaned

def validateplate(plate: str) -> bool:
    # Indian license plate regex pattern:
    # Format: [State Code][District Code][Number] (optionally followed by a letter or more numbers)
    pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{1,4}$'
    return bool(re.match(pattern, plate))

def startCapturing():
    capture_event.set()
    frame_capture_thread = threading.Thread(target=capture_frames)
    frame_capture_thread.daemon = True  # Ensure the thread exits when the program exits
    frame_capture_thread.start()

def stopCapturing():
    capture_event.clear()


# Function to capture frames from the webcam and push them into the queue
def capture_frames():
    customlog.info("Started capturing frames...")
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    while capture_event.is_set():
        success, frame = cap.read()
        if not success:
            customlog.error("Failed to grab frame while capturing the frame")
            break
        if frame_queue.full():
            frame_queue.get_nowait()
        if not frame_queue.full():
            frame_queue.put(frame)
        else:
            customlog.warning("Frame queue is full, dropping frame.")
        time.sleep(0.1)  # Add a small delay to avoid hogging CPU
    cap.release()

def gen_frames():
    detectiontime = time.time()
    timeout = 60

    startCapturing()
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            if time.time() - detectiontime > timeout:
                customlog.info("Stopping license plate detection due to inactivity...")
                break
            # Encoding the frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

        time.sleep(0.15)
    stopCapturing()

def dbConnector():
    try:
        conn = psycopg2.connect(
            host= os.getenv("DB_HOST"),
            port= os.getenv("DB_PORT"),
            dbname= os.getenv("DB_NAME"),
            user= os.getenv("DB_USER"),
            password= os.getenv("DB_PASSWORD")
            )

        conn.autocommit = True
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'licenseplate'"
        )
        exists = cursor.fetchone()
        if not exists:
            cursor.execute("CREATE DATABASE licenseplate")
            customlog.info("Database 'licenseplate' created.")
        cursor.close()
        conn.close()

        conn = psycopg2.connect(
           host= os.getenv("DB_HOST"),
            port= os.getenv("DB_PORT"),
            dbname= os.getenv("DB_NAME"),
            user= os.getenv("DB_USER"),
            password= os.getenv("DB_PASSWORD")
        )

        cursor = conn.cursor()
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS plates (
            license_plate_number VARCHAR PRIMARY KEY,
            vehicle_entered BOOLEAN,
            accuracy_percentage FLOAT
        );
        """
        )
        customlog.info("Table 'plates' is ready.")
        cursor.close()
        return conn
    except Exception as e:
        customlog.error(f"Error connecting to database: {e}")
        return None

def cleardata():
    conn = dbConnector()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM plates;")
            conn.commit()
            cursor.close()
            customlog.info("Clearing database...")
        except Exception as kumar:
            customlog.error(f"Error clearing the database: {kumar}")
        finally:
            conn.close()


def insert_into_database(plate, entered, accuracy):
    conn = dbConnector()
    if conn:
        kakashi = conn.cursor()
        accuracy = round(accuracy)
        query = """
        INSERT INTO plates (license_plate_number, vehicle_entered, accuracy_percentage)
        VALUES (%s, %s, %s)
        ON CONFLICT (license_plate_number)
        DO UPDATE SET accuracy_percentage = EXCLUDED.accuracy_percentage;
        """
        kakashi.execute(query, (plate, entered, accuracy))
        conn.commit()
        kakashi.close()
        conn.close()
        customlog.info(
            f"Inserted license plate {plate} into database with accuracy {accuracy}%."
        )
    else:
        customlog.error("Failed to insert data into database.")


# Initialize the OCR reader for English
ocr_reader = easyocr.Reader(['en'])
# Path to the Haar cascade XML file for license plate detection
cascade_file_path = "model/indian_license_plate.xml"
# Initialize the Haar Cascade Classifier for license plate detection
plate_cascade = cv2.CascadeClassifier(cascade_file_path)
# Check if the cascade classifier is loaded correctly
if plate_cascade.empty():
    customlog.error("Error: Cascade classifier file not loaded correctly.")
    raise Exception("Failed to load the license plate detection model.")

# Proceed with your license plate detection logic (example)
customlog.info("Cascade classifier loaded successfully, ready for license plate detection.")


def detectLicensePlate(image: np.ndarray):
    """
    Detects a license plate in an image, performs text recognition, validates,
    and logs the results. Avoids processing duplicate plates.

    Args:
        image (np.ndarray): Input image for license plate detection.

    Returns:
        tuple: License plate text and detection accuracy, or None if no valid plate is detected.
    """
    # Convert image to grayscale for better detection accuracy
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    height, width = gray_image.shape

    # Focus on the lower half of the image (common region for license plates)
    roi = gray_image[int(height / 2):, :]

    # Detect possible plates in the region of interest
    plates = plate_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=12, minSize=(50, 50))

    # Initialize variables for the largest detected plate
    largest_plate = None
    largest_area = 0

    for x, y, w, h in plates:
        plate_area = w * h

        # Filter out small or irrelevant areas
        # if plate_area > 1000:
        # reducing this to 500 to check whether this will work : exp : todo
        if plate_area > 500:
            y += int(height / 2)  # Adjust y position to the full image height
            aspect_ratio = w / h

            # Check if the aspect ratio is within a typical license plate range
            if 2.0 < aspect_ratio < 6.0:
                if largest_plate is None or plate_area > largest_area:
                    largest_plate = (x, y, w, h)
                    largest_area = plate_area

                # Optionally, draw the rectangle around the detected plate (for debugging purposes)
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

    # If a valid plate was detected, process it
    if largest_plate is not None:
        x, y, w, h = largest_plate
        plate_image = image[y:y + h, x:x + w]

        # Perform text recognition on the cropped plate image
        result = ocr_reader.readtext(plate_image)
        if result:
            detected_text = result[0][1].upper().strip()  # Extract text and clean it
            accuracy = result[0][2] * 100  # Convert accuracy to percentage

            # Only proceed if the accuracy is above a threshold
            if accuracy >= 40:
                cleaned_text = detected_text.replace(" ", "").upper()  # Clean the detected text

                # Validate the detected plate's format
                if validateplate(cleaned_text):
                    formatted_plate = formatplate(cleaned_text)

                    # Check for duplicates to avoid re-processing the same plate
                    if formatted_plate in duplicateplates:
                        customlog.info(f"License plate {formatted_plate} already detected, skipping detection...")
                        return None, 0

                    duplicateplates.add(formatted_plate)
                    entered = True

                    # Log the results
                    customlog.info(f"Valid license plate detected: {formatted_plate} with accuracy {accuracy:.2f}%")
                    insert_into_database(formatted_plate, entered, accuracy)  # Assuming this function handles database insertions

                    customlog.info(f"Inserted license plate {formatted_plate} into database with accuracy {accuracy:.2f}%.")
                    return formatted_plate, accuracy
                else:
                    customlog.info(f"Detected plate '{detected_text}' does not appear to be a valid license plate.")
            else:
                customlog.info(f"Detected plate with low accuracy: {detected_text} ({accuracy:.2f}%), skipping.")
    return None, 0

def licenseplatebackgroundTask(backgroundtasks: BackgroundTasks):
    customlog.info("Started capturing license plate...")
    detectiontime = time.time()
    timeout = 60

    startCapturing()
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()

            detectedtext, accuracy = detectLicensePlate(frame)  # sanji already handles logging intha koothi laa venam
            if detectedtext:
                detectiontime = time.time()
            elif time.time() - detectiontime > timeout:
                customlog.info("Stopping license plate detection due to inactivity...")
                break

        time.sleep(0.1)
    customlog.info("Finished license plate detection.")
    stopCapturing()

@luffy.get("/licenseplate")
async def l_plate_handler(backgroundtasks: BackgroundTasks):
    """Endpoint to start webcam capture."""
    backgroundtasks.add_task(licenseplatebackgroundTask, backgroundtasks)
    customlog.info("Started to capture license plate...")
    return {"message": "Capturing License Plate..."}

@luffy.get("/video_feed")
async def video_feed():
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@luffy.get("/database")
async def dbHandler():
    """Endpoint to fetch all license plates from the database."""
    conn = dbConnector()
    if not conn:
        customlog.error("Failed to connect to the database.")
        return {"error": "Failed to connect to the database"}

    try:
        dbCursor = conn.cursor()
        query = "SELECT * FROM plates;"
        dbCursor.execute(query)
        records = dbCursor.fetchall()
        dbCursor.close()
        conn.close()
        plates = [
            {
                "license_plate_number": row[0],
                "vehicle_entered": row[1],
                "accuracy_percentage": row[2],
            }
            for row in records
        ]
        customlog.info("Fetched all license plates from the database")
        return {"plates": plates}
    except Exception as itachi:
        customlog.error(f"Error fetching data from database: {itachi}")
        return {"error": str(itachi)}


# log_config = uvicorn.config.LOGGING_CONFIG
# log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
@luffy.get("/servererror")
async def servererror():
    raise Exception("Server error for testing logging")

# log_config = uvicorn.config.LOGGING_CONFIG
# log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s - %(remote_addr)s - %(request_method)s - %(path)s - %(status_code)s"
#
#
# log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"

Cleardata = True #change it to true or false. True clears the database and false does not clear the database

if __name__ == "__main__":
    # Start the frame capture thread before running the FastAPI app
    # frame_capture_thread = threading.Thread(target=capture_frames)
    # frame_capture_thread.daemon = True  # Ensure the thread exits when the program exits
    # frame_capture_thread.start()
    #
    if Cleardata:
        cleardata()
    uvicorn.run(luffy, host="127.0.0.1", port=8000)
