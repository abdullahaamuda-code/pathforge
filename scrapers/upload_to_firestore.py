import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import hashlib
from datetime import datetime

def init_firebase():
    if not firebase_admin._apps:
        # Use environment variable in GitHub Actions
        service_account = {
            "type": "service_account",
            "project_id": os.environ["FIREBASE_PROJECT_ID"],
            "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID", ""),
            "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
            "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
            "client_id": os.environ.get("FIREBASE_CLIENT_ID", ""),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(service_account)
        firebase_admin.initialize_app(cred)

    return firestore.client()


def generate_id(item):
    # Generate consistent ID from title + source so we don't duplicate
    key = f"{item['title']}-{item['source']}".lower()
    return hashlib.md5(key.encode()).hexdigest()[:20]


def upload_opportunities(db, opportunities):
    batch = db.batch()
    count = 0

    for item in opportunities:
        doc_id = generate_id(item)
        ref = db.collection("opportunities").document(doc_id)
        batch.set(ref, item, merge=True)
        count += 1

        # Firestore batch limit is 500
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            print(f"Committed {count} documents...")

    batch.commit()
    print(f"Uploaded {count} total documents to Firestore")


def main():
    print("Initializing Firebase...")
    db = init_firebase()

    all_items = []

    # Load opportunities
    if os.path.exists("scrapers/opportunities_output.json"):
        with open("scrapers/opportunities_output.json") as f:
            opps = json.load(f)
            all_items += opps
            print(f"Loaded {len(opps)} opportunities")

    # Load courses
    if os.path.exists("scrapers/courses_output.json"):
        with open("scrapers/courses_output.json") as f:
            courses = json.load(f)
            all_items += courses
            print(f"Loaded {len(courses)} courses")

    if not all_items:
        print("No data to upload")
        return

    print(f"Uploading {len(all_items)} items to Firestore...")
    upload_opportunities(db, all_items)
    print("Done!")


if __name__ == "__main__":
    main()
