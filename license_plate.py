
import cv2
import numpy as np
import easyocr

# Pretrained model path
harcascade = "model/indian_license_plate.xml"

# Loading the model, returns error if not loaded correctly
plate_cascade = cv2.CascadeClassifier(harcascade)
if plate_cascade.empty():
    print("Error: Cascade file not loaded correctly.")
    exit()

# Camera option
cap = cv2.VideoCapture(0)
cap.set(3, 640)  # Width
cap.set(4, 480)  # Height

min_area = 1000  # Area for detecting number plates
stabilization_threshold = 20  # Allow small variations before updating the detection
detection_counter = 0

# Storing the fixed number plate
last_plate = None

# EasyOCR reader setup
reader = easyocr.Reader(['en'])

def non_max_suppression(boxes, overlap_thresh=0.3):
    if len(boxes) == 0:
        return []

    boxes = boxes.astype(float)
    suppressed_boxes = []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 0] + boxes[:, 2]
    y2 = boxes[:, 1] + boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)

    idxs = y2.argsort()

    while len(idxs) > 0:
        last = len(idxs) - 1
        i = idxs[last]
        suppressed_boxes.append(i)

        xx1 = np.maximum(x1[i], x1[idxs[:last]])
        yy1 = np.maximum(y1[i], y1[idxs[:last]])
        xx2 = np.minimum(x2[i], x2[idxs[:last]])
        yy2 = np.minimum(y2[i], y2[idxs[:last]])

        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        overlap = (w * h) / areas[idxs[:last]]

        idxs = np.delete(idxs, np.concatenate(([last], np.where(overlap > overlap_thresh)[0])))

    return boxes[suppressed_boxes].astype(int)

while True:
    success, img = cap.read()
    if not success:
        print("Failed to grab frame")
        break

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Define the region of interest (ROI) to focus only on the lower half of the image where the license plate is typically located
    height, width = img_gray.shape
    roi = img_gray[int(height/2):, :]  # Focusing only on the lower half of the image

    # Detecting plates in the ROI
    plates = plate_cascade.detectMultiScale(roi, scaleFactor=1.1, minNeighbors=12, minSize=(50, 50))

    # Apply non-max suppression to remove overlapping boxes
    plates = non_max_suppression(plates)
    largest_plate = None
    largest_area = 0

    # Iterate through detected plates
    for (x, y, w, h) in plates:
        area = w * h
        if area > min_area:
            # Adjust the y-coordinate because the ROI is from the lower half of the image
            y += int(height/2)

            # Define aspect ratio constraints for license plates
            aspect_ratio = w / h
            if 2.0 < aspect_ratio < 6.0:  # Typical license plate aspect ratio
                if largest_plate is None or area > largest_area:
                    largest_plate = (x, y, w, h)
                    largest_area = area

                # Draw the rectangle immediately on the detected plate
                cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(img, "Number Plate", (x, y - 10), cv2.FONT_HERSHEY_COMPLEX_SMALL, 1, (255, 0, 255), 2)

    # Stable number plate
    if largest_plate is not None:
        if last_plate is None:
            last_plate = largest_plate
        else:
            (last_x, last_y, last_w, last_h) = last_plate
            (new_x, new_y, new_w, new_h) = largest_plate
            if abs(last_x - new_x) > stabilization_threshold or abs(last_y - new_y) > stabilization_threshold:
                last_plate = largest_plate
                detection_counter = 0
            else:
                detection_counter += 1

            if detection_counter > 10:
                (x, y, w, h) = last_plate
                cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(img, "Locked Plate", (x, y - 10), cv2.FONT_HERSHEY_COMPLEX_SMALL, 1, (255, 0, 255), 2)

                # Crop and show the largest plate found
                plate_img = img[y:y + h, x:x + w]
                plate_img_resized = cv2.resize(plate_img, (200, 100))
                cv2.imshow("Cropped Plate", plate_img_resized)

                # Use EasyOCR to extract text from the license plate image
                result = reader.readtext(plate_img)
                if result:
                    detected_text = result[0][1]
                    accuracy = result[0][2] * 100  # Convert to percentage
                    if 70 <= accuracy < 100:  # Only display if accuracy is between 85% and 99.9%
                        print(f"Vehicle Entered: {detected_text} - Accuracy: {accuracy:.2f}%")

    # Display result in crop section
    cv2.imshow("Result", img)

    # Exit the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

