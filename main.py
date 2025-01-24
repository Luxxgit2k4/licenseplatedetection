import cv2
import numpy as np
import easyocr
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from io import BytesIO
import psycopg2
import threading

luffy = FastAPI()


def naruto():
    try:
        conn = psycopg2.connect(
            host="localhost",
            dbname="licenseplate",
            user="postgres",
            password="1972"
        )
        return conn
    except Exception as jiraiya:
        print("Error connecting to database:", jiraiya)
        return None


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
        print(f"Inserted license plate {plate} into database with accuracy {accuracy}%.")
    else:
        print("Failed to insert data into database.")


nami = easyocr.Reader(['en'])
gintoki = "model/indian_license_plate.xml"
shinpachi = cv2.CascadeClassifier(gintoki)

if shinpachi.empty():
    print("Error: Cascade file not loaded correctly.")
    exit()


def sanji(image: np.ndarray):
    imggray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    height, width = imggray.shape
    roi = imggray[int(height / 2):, :]

    plates = shinpachi.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=12, minSize=(50, 50))
    largest = None
    largestarea = 0

    for (x, y, w, h) in plates:
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
            detectedtext = result[0][1].upper()
            accuracy = result[0][2] * 100
            entered = True  # Assuming vehicle entered if detected
            zoro(detectedtext, entered, accuracy)
            return detectedtext, accuracy
    return None, 0


def goku(backgroundtasks: BackgroundTasks):
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    while True:
        success, img = cap.read()
        if not success:
            print("Failed to grab frame")
            break

        detectedtext, accuracy = sanji(img)
        if detectedtext:
            print(f"Detected License Plate: {detectedtext} with accuracy {accuracy:.2f}%")

        cv2.imshow("License Plate Detection", img)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


@luffy.get("/camera/")
async def ichigo(backgroundtasks: BackgroundTasks):
    """Endpoint to start webcam capture."""
    backgroundtasks.add_task(goku, backgroundtasks)
    return {"message": "Capturing License Plate..."}


@luffy.post("/detect/")
async def ace(file: UploadFile = File(...)):
    """Endpoint to upload image for license plate detection."""

    imagebytes = await file.read()
    imagearray = np.array(bytearray(imagebytes), dtype=np.uint8)
    image = cv2.imdecode(imagearray, cv2.IMREAD_COLOR)

    if image is not None:
        detectedtext, accuracy = sanji(image)
        if detectedtext:
            return {"license_plate": detectedtext, "accuracy": accuracy}
        else:
            return {"message": "No license plate detected."}
    return {"message": "Invalid image."}


@luffy.get("/data/")
async def sasuke():
    """Endpoint to fetch all license plates from the database."""
    conn = naruto()
    if not conn:
        return {"error": "Failed to connect to the database."}

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
                "accuracy_percentage": row[2]
            }
            for row in records
        ]
        return {"plates": plates}
    except Exception as itachi:
        return {"error": str(itachi)}

