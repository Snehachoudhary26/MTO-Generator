"use client";

import { useState } from "react";

interface MTOItem {
  item_no: number;
  category: string;
  description: string;
  size_nps: string;
  schedule_rating: string;
  material_spec: string;
  end_type: string;
  quantity: number;
  unit: string;
  length_m: number;
  confidence: number;
  remarks: string;
}

interface DrawingMeta {
  drawing_no: string | null;
  job_details: string | null;
  unit: string | null;
  pipe_sizes: string[];
  engineer: string | null;
  date: string | null;
}

interface Summary {
  total_line_items: number;
  total_pipe_length_m: number;
  total_welds: number;
  total_fittings: number;
  total_valves: number;
}

interface MTOResponse {
  source?: string;
  filename?: string;
  drawing_meta?: DrawingMeta;
  mto: MTOItem[];
  summary?: Summary;
  generated_at?: string;
  error?: string;
}

const API_BASE = "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<MTOResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setError(null);

    if (selected && selected.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  }

  async function handleUpload() {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("File too large. Max size is 20 MB.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/extract-mto`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Extraction failed");
      }

      const data: MTOResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadCsv() {
    if (!result?.filename) return;
    const res = await fetch(
      `${API_BASE}/extract-mto/csv?filename=${encodeURIComponent(result.filename)}`
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename}_mto.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">MTO Generator</h1>
      <p className="text-gray-600 mb-6">
        Upload a piping isometric drawing (PDF, PNG, or JPG, max 20MB) to generate a Material Take-Off.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Generate MTO"}
        </button>
        {result && (
          <button
            onClick={handleDownloadCsv}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Download CSV
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drawing preview */}
          <div className="lg:col-span-1">
            <h2 className="font-semibold mb-2 text-gray-700">Drawing Preview</h2>
            <div className="border border-gray-300 rounded bg-gray-50 h-64 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Drawing preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-gray-400 text-sm">
                  {file?.type === "application/pdf" ? "PDF preview not shown inline" : "No preview available"}
                </span>
              )}
            </div>

            {result.drawing_meta && (
              <div className="mt-4 text-sm border border-gray-300 rounded p-4 bg-white">
                <h3 className="font-semibold mb-2">Drawing Info</h3>
                <p><strong>Drawing No:</strong> {result.drawing_meta.drawing_no ?? "-"}</p>
                <p><strong>Job:</strong> {result.drawing_meta.job_details ?? "-"}</p>
                <p><strong>Unit:</strong> {result.drawing_meta.unit ?? "-"}</p>
                <p><strong>Pipe Sizes:</strong> {result.drawing_meta.pipe_sizes?.join(", ") || "-"}</p>
              </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
              Source: <strong>{result.source}</strong>
              {result.filename && <> · File: <strong>{result.filename}</strong></>}
            </div>
          </div>

          {/* MTO table + summary */}
          <div className="lg:col-span-2">
            {result.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <SummaryCard label="Line Items" value={result.summary.total_line_items} />
                <SummaryCard label="Pipe Length (m)" value={result.summary.total_pipe_length_m} />
                <SummaryCard label="Welds" value={result.summary.total_welds} />
                <SummaryCard label="Fittings" value={result.summary.total_fittings} />
                <SummaryCard label="Valves" value={result.summary.total_valves} />
              </div>
            )}

            {result.error && (
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
                {result.error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left">#</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Size</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Sched/Rating</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Material</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">End Type</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Qty</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Unit</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Length (m)</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Conf.</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {result.mto.map((item) => (
                    <tr key={item.item_no} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 py-2">{item.item_no}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.category}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.description}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.size_nps}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.schedule_rating}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.material_spec}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.end_type}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.quantity}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.unit}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.length_m}</td>
                      <td className="border border-gray-300 px-2 py-2">{(item.confidence * 100).toFixed(0)}%</td>
                      <td className="border border-gray-300 px-2 py-2">{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-300 rounded p-3 bg-white text-center">
      <div className="text-xl font-bold text-blue-600">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
