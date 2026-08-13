import os
import shutil

valid_images = r"pothole\pothole.v18i.yolov8\valid\images"
train_labels = r"pothole\pothole.v18i.yolov8\train\labels"
valid_labels = r"pothole\pothole.v18i.yolov8\valid\labels"

os.makedirs(valid_labels, exist_ok=True)

for image in os.listdir(valid_images):
    filename = os.path.splitext(image)[0]
    label_file = filename + ".txt"

    src = os.path.join(train_labels, label_file)
    dst = os.path.join(valid_labels, label_file)

    if os.path.exists(src):
        shutil.move(src, dst)

print("All matching labels moved!")