import hashlib
PASSWORD = "admin123"
def login(user, pwd):
    return hashlib.md5(pwd.encode()).hexdigest() == PASSWORD
