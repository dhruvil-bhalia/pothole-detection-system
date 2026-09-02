from turtle import width

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
import os
import uuid
import glob
import shutil

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(
    os.path.dirname(__file__),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )

model_path = os.path.join(
    os.path.dirname(__file__),
    "runs",
    "detect",
    "train-3",
    "weights",
    "best.pt"
)

model = YOLO(model_path)


@app.route("/detect", methods=["POST"])
def detect():

    file = request.files["image"]

    temp_file = f"temp_{uuid.uuid4()}.jpg"
    file.save(temp_file)

    results = model.predict(
        source=temp_file,
        conf=0.25,
        save=True,
        project="runs/detect",
        name=f"predict_{uuid.uuid4()}",
        exist_ok=True
    )

    detections = []

    for result in results:

        for box in result.boxes:

            print("CONF:", float(box.conf))

            x1, y1, x2, y2 = box.xyxy[0]

            width = float(x2 - x1)
            height = float(y2 - y1)

            area = width * height

            print("=" * 40)
            print("Width :", width)
            print("Height:", height)
            print("Area  :", area)
            print("=" * 40)

            if area < 10000:
                severity = "Low"
            elif area < 40000:
                severity = "Medium"
            else:
                severity = "High"

            detections.append({
                "confidence": float(box.conf),
                "severity": severity,
                "bbox": [
                    float(x1),
                    float(y1),
                    float(x2),
                    float(y2)
                ]
            })

    if len(detections) == 0:

        if os.path.exists(temp_file):
            os.remove(temp_file)

        return jsonify({
            "detected": False,
            "count": 0,
            "detections": [],
            "boxedImage": ""
        })
    
    latest_predict = results[0].save_dir

    boxed_image_url = ""

    image_files = []

    for ext in ["*.jpg", "*.jpeg", "*.png"]:
        image_files.extend(
            glob.glob(os.path.join(latest_predict, ext))
        )

    if image_files:

        boxed_image = image_files[0]

        print("SELECTED IMAGE:", boxed_image)

        upload_folder = UPLOAD_FOLDER

        boxed_filename = (
            f"boxed_{uuid.uuid4()}.jpg"
        )

        boxed_upload_path = os.path.join(
            upload_folder,
            boxed_filename
        )

        shutil.copy(
            boxed_image,
            boxed_upload_path
        )

        boxed_image_url = (
            f"{request.host_url.rstrip('/')}/uploads/{boxed_filename}"
        )

    if os.path.exists(temp_file):
        os.remove(temp_file)

    return jsonify({
        "detected": len(detections) > 0,
        "count": len(detections),
        "detections": detections,
        "boxedImage": boxed_image_url
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )