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

duplicateplates = set()

def formatplate(plate: str) -> str:
    cleaned = plate.replace(" ", "").upper()
    if len(cleaned) == 10:
        return f"{cleaned[0:2]} {cleaned[2:4]} {cleaned[4:6]} {cleaned[6:10]}"
    return cleaned

def validateplate(plate: str) -> bool:
    cleaned = plate.replace(" ", "")
    return len(cleaned) == 10

def naruto():
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
    conn = naruto()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM plates;")
            conn.commit()
            cursor.close()
            customlog.info("Clearing database...")
        except kumar as e:
            customlog.error(f"Error clearing the database: {e}")
        finally:
            conn.close()


def zoro(plate, entered, accuracy):
    conn = naruto()
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


nami = easyocr.Reader(["en"])
gintoki = "model/indian_license_plate.xml"
shinpachi = cv2.CascadeClassifier(gintoki)

if shinpachi.empty():
    customlog.error("Error: Cascade file not loaded correctly.")
    exit()

def sanji(image: np.ndarray):
    imggray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    height, width = imggray.shape
    roi = imggray[int(height / 2):, :]

    plates = shinpachi.detectMultiScale(
        roi, scaleFactor=1.1, minNeighbors=12, minSize=(50, 50)
    )
    largest = None
    largestarea = 0

    for x, y, w, h in plates:
        area = w * h
        if area > 1000:
            y += int(height / 2)
            ratio = w / h
            if 2.0 < ratio < 6.0:
                if largest is None or area > largestarea:
                    largest = (x, y, w, h)
                    largestarea = area
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

    if largest is not None:
        (x, y, w, h) = largest
        plateimg = image[y:y + h, x:x + w]
        result = nami.readtext(plateimg)
        if result:
            detectedtext = result[0][1].upper().strip()
            accuracy = result[0][2] * 100
            if validateplate(detectedtext):
                formattedplate = formatplate(detectedtext)
                if formattedplate in duplicateplates:
                    customlog.info(f"License plate {formattedplate} already detected, skipping detection...")
                    return None, 0
                duplicateplates.add(formattedplate)
                entered = True
                zoro(formattedplate, entered, accuracy)
                customlog.info(f"Valid license plate detected: {formattedplate} with accuracy {accuracy:.2f}%")
                return formattedplate, accuracy
            else:
                customlog.info(f"Detected text '{detectedtext}' does not appear to be a valid license plate.")
    return None, 0

def goku(backgroundtasks: BackgroundTasks):
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    customlog.info("Started capturing license plate...")

    detectiontime = time.time()
    timeout = 60

    while True:
        success, img = cap.read()
        if not success:
            customlog.error("Failed to grab frame")
            break

        detectedtext, accuracy = sanji(img)
        if detectedtext:
            customlog.info(
                f"Detected License Plate: {detectedtext} with accuracy {accuracy:.2f}%"
            )
            detectiontime = time.time()
        else:

            if time.time() - detectiontime > timeout:
                customlog.info("Stopping licenseplate detection due to inactivity...")
                break

    cap.release()


@luffy.get("/licenseplate")
async def ichigo(backgroundtasks: BackgroundTasks):
    """Endpoint to start webcam capture."""
    backgroundtasks.add_task(goku, backgroundtasks)
    customlog.info("Started to capture license plate...")
    return {"message": "Capturing License Plate..."}

@luffy.get("/database")
async def sasuke():
    """Endpoint to fetch all license plates from the database."""
    conn = naruto()
    if not conn:
        customlog.error("Failed to connect to the database.")
        return {"error": "Failed to connect to the database"}

    try:
        kakashi = conn.cursor()
        query = "SELECT * FROM plates;"
        kakashi.execute(query)
        records = kakashi.fetchall()
        kakashi.close()
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

Cleardata = True

if __name__ == "__main__":
    if Cleardata:
        cleardata()
    uvicorn.run(luffy, host="127.0.0.1", port=8000)
