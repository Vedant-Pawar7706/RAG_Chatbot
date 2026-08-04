import os, sys
import dotenv
from google import genai

dotenv.load_dotenv('.env')
api_key = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key=api_key)

print("Listing and testing models...")
all_models = list(client.models.list())
for m in all_models:
    name = m.name.replace("models/", "")
    try:
        res = client.models.generate_content(model=name, contents="Hello, reply with 1 word.")
        if res and res.text:
            print(f"SUCCESS: '{name}' -> '{res.text.strip()}'")
    except Exception as e:
        err = str(e).split('\n')[0]
        print(f"FAILED:  '{name}' -> {err[:100]}")
