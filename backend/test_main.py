import io
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_returns_status():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "mode" in data


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_extract_mto_rejects_invalid_file_type():
    fake_file = io.BytesIO(b"not a real file")
    response = client.post(
        "/extract-mto",
        files={"file": ("test.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_extract_mto_rejects_empty_file():
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/extract-mto",
        files={"file": ("test.pdf", empty_file, "application/pdf")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_extract_mto_mock_mode_returns_valid_schema(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    fake_pdf = io.BytesIO(b"%PDF-1.4 fake pdf content for testing")
    response = client.post(
        "/extract-mto",
        files={"file": ("test.pdf", fake_pdf, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["source"] == "mock"
    assert "mto" in data
    assert "summary" in data
    assert "drawing_meta" in data
    assert len(data["mto"]) > 0
    first_item = data["mto"][0]
    assert "item_no" in first_item
    assert "category" in first_item
    assert "confidence" in first_item


def test_csv_export_requires_prior_extraction():
    response = client.get("/extract-mto/csv?filename=nonexistent_file.pdf")
    assert response.status_code == 404
