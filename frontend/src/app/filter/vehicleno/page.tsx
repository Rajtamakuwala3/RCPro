"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const apiUrl = process.env.NEXT_PUBLIC_API_URL

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
        `${apiUrl}/api/v1/fetch/fetchbyvehicleno/${vehicleNo}`,
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
        <h2 className="text-xl font-semibold text-center">
          Search RC Book by Vehicle Number
        </h2>
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

        {rcData && (
          <div className="space-y-2">
            {Object.entries(rcData)
              .filter(
                ([key]) =>
                  key !== "createdAt" &&
                  key !== "updatedAt" &&
                  key !== "customerId"
              )
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-start text-sm gap-2 border-b border-white/10 py-1"
                >
                  <span className="text-gray-400 capitalize whitespace-nowrap">
                    {key}
                  </span>
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
                    <span className="font-medium text-right break-words max-w-[60%]">
                      {value?.toString()}
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
