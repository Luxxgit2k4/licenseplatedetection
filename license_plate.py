import cv2
import numpy as np
import os

#pretrrained model path 
harcascade = "model/indian_license_plate.xml"

#loading the model returns error if it is not loaded 
plate_cascade = cv2.CascadeClassifier(harcascade)
if plate_cascade.empty():
    print("Error: Cascade file not loaded correctly.")
    exit()
    #camera option
cap = cv2.VideoCapture(0)
cap.set(3, 640)  #width
cap.set(4, 480)  #height

min_area = 1000  #area for detecting number plates 
stabilization_threshold = 20  # Allow small variations before updating the detection
detection_counter = 0

#storing the fixed number plate
last_plate = None

#creating a directory to save number plate
save_dir = "platesdata"
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

#image saving check
image_saved = False

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

    plates = plate_cascade.detectMultiScale(img_gray, scaleFactor=1.1, minNeighbors=12, minSize=(50, 50))

    #avoiding overlapping
    plates = non_max_suppression(plates)
    largest_plate = None
    largest_area = 0

    # Iterate through detected plates
    for (x, y, w, h) in plates:
        area = w * h
        if area > min_area:
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
                plate_img = img[y:y+h, x:x+w]
                plate_img_resized = cv2.resize(plate_img, (200, 100))
                cv2.imshow("Cropped Plate", plate_img_resized)
                if not image_saved:
                    filename = os.path.join(save_dir, "plate_{}.jpg".format(cv2.getTickCount()))
                    cv2.imwrite(filename, plate_img)
                    print(f"Plate image saved as {filename}")
                    image_saved = True  #avoiding loop to save number plate

    #result in crop section
    cv2.imshow("Result", img)

    # Exit the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()
