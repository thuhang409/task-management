# task-management
The basic task management application

## Setting Up a Basic Flask Application
### 1. Clone the Repository
```bash
git clone https://github.com/thuhang409/task-management.git
```

### 2. Create and Activate Virtual Environment
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Initialize Database (Flask-Migrate)
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 5. Run the Flask Application
```bash
flask run
```
By default, the app runs on http://127.0.0.1:5000/.
