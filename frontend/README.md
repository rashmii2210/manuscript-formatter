# Manuscript Formatter

## Description
Manuscript Formatter is a full-stack web application that allows users to upload documents (`.docx`, `.tex`, or `.txt`), parses their content and metadata, and automatically formats them into standard LaTeX manuscript styles. It evaluates the document's compliance with formatting rules, generates a compliance score, and provides explainable corrections.

## Dependencies

### Backend Dependencies
* **Python 3.x**
* **Flask** & **Flask-CORS**: For the REST API server.
* **Werkzeug**: For secure file handling.
* **spaCy**: For natural language processing and document parsing (`en_core_web_sm` model).
* **Requests** & **HTTPX**: For handling API requests.

### Frontend Dependencies
* **Node.js** & **npm**
* **React 19**: UI library.
* **Vite**: Frontend build tool and development server.
* **Tailwind CSS**: Utility-first CSS framework for styling.
* **Zustand**: State management.
* **KaTeX** & **react-latex-next**: For rendering LaTeX and mathematical equations in the browser.

## Installation Steps

### Step 1: Backend Setup

Open a terminal and navigate to the `backend` directory.

#### Step 1.1: Create and activate a virtual environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

#### Step 1.2: Install Python dependencies
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```
Troubleshooting spaCy: If the download fails, force-reinstall or use the direct tarball:

```bash
pip install --upgrade --force-reinstall spacy==3.7.2
# OR
pip install [https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1.tar.gz](https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1.tar.gz)
```

Optional fix for dependency conflicts:

```bash
pip install "httpx<0.28.0"
python -m pip install --upgrade pip setuptools wheel
```

#### Step 1.3: Set Environment Variables
```bash
# On Windows PowerShell:
$env:GEMINI_API_KEY="YOUR_API_KEY_HERE"

# On macOS/Linux:
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

#### Step 1.4: Run the Backend Server
```bash
python app.py
```

The backend server will start on `http://127.0.0.1:5000`.

### Step 2: Frontend Setup

Open a new terminal and navigate to the frontend directory.

#### Step 2.1: Install Node modules

```bash
npm install
```

#### Step 2.2: Start the Development Server

```bash
npm run dev
```

### Step 3: Running the Test Pipeline (Optional)

To test the backend parsing and formatting pipeline without the UI, open another terminal, activate the virtual environment, and run:

```bash
venv\Scripts\activate
pip install requests
python test_pipeline.py
```