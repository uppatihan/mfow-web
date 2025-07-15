Step run Program
  1. cd frontend --> npm install
  2. create file config.js --> path frontend/src/config.js
     2.1 export const API_BASE_URL *http://localhost:8000*
     2.2 export const FILE_SERVICE_URL *url for download file server*
     3.3 export const API_KEY *token key for download file server*
3. create file .env --> root path 
   3.1 ORA_USER
   3.2 ORA_PASSWORD
   3.3 ORA_DSN
   3.4 FILE_SERVICE_URL *url for download file server*
   3.5 API_KEY *token key for download file server*

cmd run program
backend
pip install -r requirements.txt
  - on local
uvicorn main:app --reload
  - on host public
uvicorn main:app --host 0.0.0.0 --port 8000

frontend
npm run dev
