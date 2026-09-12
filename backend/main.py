import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    debug = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=debug)
