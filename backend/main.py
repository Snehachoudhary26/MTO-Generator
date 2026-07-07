import os
import io
import csv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from mto_extractor import extract_mto

load_dotenv()

app = FastAPI(title="MTO Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/jpg"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

# In-memory store for the most recent result, keyed by filename (simple, no DB needed for this scope)
_last_results: dict = {}


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "MTO Generator API is running",
        "mode": "gemini" if os.getenv("GEMINI_API_KEY") else "mock",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.post("/extract-mto")
async def extract_mto_endpoint(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Upload PDF, PNG, or JPG.",
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(file_bytes) / 1024 / 1024:.1f} MB). Max size is 20 MB.",
        )

    try:
        result = extract_mto(file_bytes, file.filename, file.content_type)
        _last_results[file.filename] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MTO extraction failed: {str(e)}")


@app.get("/extract-mto/csv")
async def export_csv(filename: str):
    if filename not in _last_results:
        raise HTTPException(status_code=404, detail="No MTO result found for that filename. Run extraction first.")

    result = _last_results[filename]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "item_no", "category", "description", "size_nps", "schedule_rating",
        "material_spec", "end_type", "quantity", "unit", "length_m",
        "confidence", "remarks",
    ])
    for item in result.get("mto", []):
        writer.writerow([
            item.get("item_no"), item.get("category"), item.get("description"),
            item.get("size_nps"), item.get("schedule_rating"), item.get("material_spec"),
            item.get("end_type"), item.get("quantity"), item.get("unit"),
            item.get("length_m"), item.get("confidence"), item.get("remarks"),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}_mto.csv"},
    )
