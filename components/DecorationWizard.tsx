"use client";

import { useState } from "react";

const DECORATION_METHODS = [
  { code: "SCREEN", name: "Screen Printing" },
  { code: "EMB", name: "Embroidery" },
  { code: "DTG", name: "Direct to Garment" },
  { code: "DTF", name: "Direct to Film" },
];

const LOCATIONS = [
  "Left Chest",
  "Full Front",
  "Full Back",
  "Right Sleeve",
  "Left Sleeve",
  "Collar",
  "Other",
];

interface DecorationConfig {
  method: string;
  locations: Array<{
    location: string;
    config: any;
    artworkUrl?: string;
  }>;
}

export function DecorationWizard({
  cartItemId,
  onComplete,
}: {
  cartItemId: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<DecorationConfig>({
    method: "",
    locations: [],
  });
  const [loading, setLoading] = useState(false);

  const handleMethodSelect = (method: string) => {
    setConfig({ method, locations: [] });
    setStep(2);
  };

  const handleLocationAdd = (location: string) => {
    setConfig((prev) => ({
      ...prev,
      locations: [...prev.locations, { location, config: {} }],
    }));
  };

  const handleLocationConfig = (index: number, field: string, value: any) => {
    setConfig((prev) => {
      const newLocations = [...prev.locations];
      newLocations[index] = {
        ...newLocations[index],
        config: {
          ...newLocations[index].config,
          [field]: value,
        },
      };
      return { ...prev, locations: newLocations };
    });
  };

  const handleArtworkUpload = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      handleLocationConfig(index, "artworkUrl", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload artwork");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/decoration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItemId,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save decoration");
      }

      onComplete();
    } catch (error) {
      alert("Failed to save decoration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Add Decoration</h3>

      {step === 1 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">Select decoration method:</p>
          <div className="grid grid-cols-2 gap-3">
            {DECORATION_METHODS.map((method) => (
              <button
                key={method.code}
                onClick={() => handleMethodSelect(method.code)}
                className="p-4 border border-gray-300 rounded hover:border-indigo-500 hover:bg-indigo-50 text-left"
              >
                <div className="font-medium">{method.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">Select locations:</p>
          <div className="space-y-2 mb-4">
            {LOCATIONS.map((location) => (
              <button
                key={location}
                onClick={() => handleLocationAdd(location)}
                className="w-full p-2 border border-gray-300 rounded hover:border-indigo-500 hover:bg-indigo-50 text-left"
              >
                {location}
              </button>
            ))}
          </div>
          {config.locations.length > 0 && (
            <button
              onClick={() => setStep(3)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Configure Locations ({config.locations.length})
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">Configure each location:</p>
          <div className="space-y-4">
            {config.locations.map((loc, index) => (
              <div key={index} className="border rounded p-4 bg-white">
                <h4 className="font-medium mb-2">{loc.location}</h4>
                {config.method === "SCREEN" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-700">
                        Number of Colors
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={loc.config.numberOfColors || ""}
                        onChange={(e) =>
                          handleLocationConfig(
                            index,
                            "numberOfColors",
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={loc.config.underbase || false}
                          onChange={(e) =>
                            handleLocationConfig(index, "underbase", e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Underbase</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Print Size</label>
                      <input
                        type="text"
                        value={loc.config.printSize || ""}
                        onChange={(e) =>
                          handleLocationConfig(index, "printSize", e.target.value)
                        }
                        placeholder="e.g., 4x4 inches"
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}
                {config.method === "EMB" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-700">
                        Stitch Count (or leave blank to estimate later)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={loc.config.stitchCount || ""}
                        onChange={(e) =>
                          handleLocationConfig(
                            index,
                            "stitchCount",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}
                {(config.method === "DTG" || config.method === "DTF") && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-700">Print Size</label>
                      <input
                        type="text"
                        value={loc.config.printSize || ""}
                        onChange={(e) =>
                          handleLocationConfig(index, "printSize", e.target.value)
                        }
                        placeholder="e.g., 12x12 inches"
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">Notes</label>
                      <textarea
                        value={loc.config.notes || ""}
                        onChange={(e) =>
                          handleLocationConfig(index, "notes", e.target.value)
                        }
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Upload Artwork
                  </label>
                  <input
                    type="file"
                    accept=".ai,.pdf,.png,.jpg,.jpeg,.dst"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleArtworkUpload(index, file);
                    }}
                    className="text-sm"
                  />
                  {loc.artworkUrl && (
                    <p className="text-xs text-green-600 mt-1">Uploaded</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Decoration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

