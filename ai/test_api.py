import requests

url = "http://127.0.0.1:5001/detect"

files = {
    "image": open("test.jpg", "rb")
}

response = requests.post(
    url,
    files=files
)

print(response.json())