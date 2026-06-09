import requests

with open('test.docx', 'wb') as f:
    f.write(b'PK\x03\x04\x14\x00\x08\x08\x08\x00') # fake docx

files = {'file': ('test.docx', open('test.docx', 'rb'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
data = {'documentType': 'invoice'}
r = requests.post('http://localhost:8080/api/documents/upload', files=files, data=data)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
