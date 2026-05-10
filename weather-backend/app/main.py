from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.routes import auth, weather, favorites, settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather API", version="1.0.0", docs_url="/docs", redoc_url="/redoc", default_response_class=JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def set_encoding_header(request, call_next):
    response = await call_next(request)
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    return response

app.include_router(auth.router)
app.include_router(weather.router)
app.include_router(favorites.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Weather API"}