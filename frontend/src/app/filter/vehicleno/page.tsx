"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function page() {
  const [vehicleNo, setVehicleNo] = useState("");
  const [rcData, setRcData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchRCDetails = async () => {
    if (!vehicleNo) {
      alert("Please enter a vehicle number");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/fetch/fetchbyvehicleno/${vehicleNo}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await res.json();

      if (res.ok) {
        setRcData(result.data);
      } else {
        alert(result.message || "Vehicle not found");
        setRcData(null);
      }
    } catch (err) {
      alert("Failed to fetch RC Book data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f0f0f] px-4">
      <div className="w-full max-w-xl bg-black text-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold text-center">Search RC Book by Vehicle Number</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter vehicle number e.g. GJ05ZZ9049"
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
          />
          <Button onClick={fetchRCDetails} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

    {rcData &&
  Object.entries(rcData).map(([key, value]) => (
    <div key={key} className="flex justify-between text-sm">
      <span className="text-gray-400">{key}</span>
      {key === "imageUrl" ? (
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline font-medium"
        >
          RC BOOK IMAGE
        </a>
      ) : (
        <span className="font-medium">{value?.toString()}</span>
      )}
    </div>
))}



      </div>
    </div>
  );
}

export default page;
