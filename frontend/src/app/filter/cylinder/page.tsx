"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const apiUrl = process.env.NEXT_PUBLIC_API_URL

function Page() {
  const [month, setMonth] = useState<number>(11);
  const [year, setYear] = useState<number>(2025);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFitnessData = async () => {
    if (!month || !year) {
      alert("Please enter both month and year.");
      return;
    }

    setLoading(true);
    setData([]);

    try {
      const url = `${apiUrl}/api/v1/fetch/fetchbycylindermonth?month=${month}&year=${year}`;
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        setData(result.data || []);
      } else {
        alert(result.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen pt-34 px-6">
      <div className="w-full bg-black p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Fetch Cylinder Data by Month & Year
        </h2>
        <div className="flex gap-3 flex-wrap justify-center">
          <Input
            type="number"
            className="w-24"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <Input
            type="number"
            className="w-28"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <Button
            onClick={fetchFitnessData}
            disabled={loading}
            className="w-24"
          >
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </div>

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="text-gray-300">
                Fetched RC Book Insurance Data
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone No</TableHead>
                  {Object.keys(data[0] || {})
                    .filter(
                      (key) =>
                        !["customer", "createdAt", "updatedAt"].includes(key)
                    )
                    .map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="break-words max-w-[160px] whitespace-pre-wrap">
                      {item.customer?.name || "N/A"}
                    </TableCell>
                    <TableCell className="break-words max-w-[160px] whitespace-pre-wrap">
                      {item.customer?.phoneNo || "N/A"}
                    </TableCell>

                    {Object.entries(item)
                      .filter(
                        ([key]) =>
                          !["customer", "createdAt", "updatedAt"].includes(key)
                      )
                      .map(([key, value]) => (
                        <TableCell
                          key={key}
                          className="break-words max-w-[160px] whitespace-pre-wrap"
                        >
                          {key === "imageUrl" && value ? (
                            <a
                              href={value as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline"
                            >
                              RC BOOK IMAGE
                            </a>
                          ) : (
                            value?.toString()
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-gray-400">
              No data available for selected month/year.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default Page;
