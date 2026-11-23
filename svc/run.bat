@echo off
rem Always run from the folder that contains this file (svc), no matter where it is started from.
cd /d "%~dp0"
call .venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
