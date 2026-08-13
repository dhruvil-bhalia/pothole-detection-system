from ultralytics import YOLO

# Load trained model
model = YOLO(
    r"runs/detect/train-3/weights/best.pt"
)

# Run detection on image
results = model.predict(
    source="test.jpg",
    conf=0.25,
    save=True
)

print("Detection Complete!")