import React, { useState } from "react";
import { searchProductsByImage } from "../Product/apiService";
import Button from "../../../components/ui/Button";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setBusy(true);
    setError("");
    setLabel("");
    try {
      const { products, predictedLabel } = await searchProductsByImage(file);
      setResults(products || []);
      setLabel(predictedLabel || "");
    } catch (err) {
      setError(err?.message || "Upload failed. Check that the API is running.");
      setResults([]);
      setLabel("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-lg font-semibold mb-2">Search by image</h1>
      <p className="text-sm text-gray-600 mb-4">
        Uses the same endpoint as the shop: upload a photo to find matching
        products (AI label + catalog search).
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <Button type="submit" disabled={busy}>
          {busy ? "Searching…" : "Upload & search"}
        </Button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {label && (
        <p className="text-sm text-indigo-700 mt-2">
          Detected label: <strong>{label}</strong>
        </p>
      )}
      {results.length > 0 && (
        <ul className="mt-4 list-disc pl-5 text-sm">
          {results.map((p) => (
            <li key={p._id}>{p.title || p.brand || p._id}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ImageUpload;
