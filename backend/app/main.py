from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, holds, routes, attempts

app = FastAPI(title="ClimbAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(holds.router, prefix="/api/holds", tags=["holds"])
app.include_router(routes.router, prefix="/api/routes", tags=["routes"])
app.include_router(attempts.router, prefix="/api/attempts", tags=["attempts"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
