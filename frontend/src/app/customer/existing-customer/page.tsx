"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

function OcrUploadSection({ customerId }: { customerId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !customerId) {
      alert("Both customer ID and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("id", customerId.toString());
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:8080/api/v1/ocr/imagetotext", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        alert("OCR Processed Successfully");
        console.log(result);
      } else {
        alert(result?.message || "Upload failed");
      }
    } catch (error) {
      alert("Something went wrong");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-semibold text-center text-white">
        Upload RC Book Image
      </h3>
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={(files) => setFile(files[0] || null)} />
      </div>
      <div className="flex justify-center">
        <button
          disabled={uploading}
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded mt-4 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Submit for OCR"}
        </button>
      </div>
    </div>
  );
}

function Page() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/customer/search?q=${query}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const result = await res.json();
        if (res.ok) setSuggestions(result.data || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setQuery(customer.name);
    setSuggestions([]);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      handleSelect(suggestions[highlightIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 py-40 flex justify-center items-start">
      <div className="bg-black p-6 rounded-lg shadow w-full max-w-xl space-y-4 relative">
        <h2 className="text-xl font-semibold text-center">Search Customer</h2>

        <Input
          placeholder="Type customer name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCustomer(null);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />

        {suggestions.length > 0 && !selectedCustomer && (
          <div className="absolute top-28 left-6 right-6 bg-white text-black rounded shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((cust, index) => (
              <div
                key={cust.id}
                className={`px-4 py-2 cursor-pointer ${
                  index === highlightIndex
                    ? "bg-blue-100 font-semibold"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => handleSelect(cust)}
              >
                {cust.name} ({cust.phoneNo})
              </div>
            ))}
          </div>
        )}

        {selectedCustomer && (
          <>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Customer ID</span>
                <span>{selectedCustomer.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span>{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone No</span>
                <span>{selectedCustomer.phoneNo}</span>
              </div>
            </div>
            <OcrUploadSection customerId={selectedCustomer.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default Page;
