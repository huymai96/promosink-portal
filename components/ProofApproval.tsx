"use client";

import { useState } from "react";

interface Proof {
  id: string;
  status: string;
  customerComment?: string | null;
  createdAt: Date;
}

interface ArtworkAsset {
  id: string;
  blobUrl: string;
  fileName: string;
  isProof: boolean;
}

interface Decoration {
  id: string;
  proofs: Proof[];
  artworkAssets: ArtworkAsset[];
}

export function ProofApproval({ decoration }: { decoration: Decoration }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const latestProof = decoration.proofs[0];

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/proofs/${latestProof.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve proof");
      }

      window.location.reload();
    } catch (error) {
      alert("Failed to approve proof");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert("Please provide a comment explaining what needs to be changed");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/proofs/${latestProof.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject proof");
      }

      window.location.reload();
    } catch (error) {
      alert("Failed to reject proof");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("decorationId", decoration.id);
      formData.append("isProof", "true");

      const response = await fetch(`/api/orders/decorations/${decoration.id}/artwork`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload artwork");
      }

      window.location.reload();
    } catch (error) {
      alert("Failed to upload artwork");
    } finally {
      setUploading(false);
    }
  };

  if (!latestProof) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">No proof available yet.</p>
      </div>
    );
  }

  const proofAssets = decoration.artworkAssets.filter((a) => a.isProof);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded">
      <h4 className="font-medium mb-2">Proof Status</h4>
      <div className="mb-2">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            latestProof.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : latestProof.status === "REJECTED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {latestProof.status.replace("_", " ")}
        </span>
      </div>

      {proofAssets.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Proof Files:</p>
          <div className="space-y-2">
            {proofAssets.map((asset) => (
              <a
                key={asset.id}
                href={asset.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-indigo-600 hover:text-indigo-700"
              >
                {asset.fileName}
              </a>
            ))}
          </div>
        </div>
      )}

      {latestProof.status === "PENDING_CUSTOMER" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Add any comments..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Approve Proof"}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Request Changes"}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload New Artwork
            </label>
            <input
              type="file"
              accept=".ai,.pdf,.png,.jpg,.jpeg,.dst"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          </div>
        </div>
      )}

      {latestProof.customerComment && (
        <div className="mt-2 p-2 bg-white rounded text-sm">
          <p className="font-medium">Your Comment:</p>
          <p className="text-gray-600">{latestProof.customerComment}</p>
        </div>
      )}
    </div>
  );
}

