# utils.py
import tempfile
import os
import uuid

def save_uploaded_file(file_storage):
    """
    Saves a Werkzeug FileStorage to a temp file and returns its path.
    Caller should remove the file when done.
    """
    suffix = os.path.splitext(file_storage.filename)[1] or ".jpg"
    tmp_dir = tempfile.gettempdir()
    tmp_name = f"upload_{uuid.uuid4().hex}{suffix}"
    path = os.path.join(tmp_dir, tmp_name)
    file_storage.save(path)
    return path
