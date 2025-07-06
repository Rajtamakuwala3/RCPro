"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phoneNo: z
    .string()
    .regex(/^\d{10}$/, {
      message: "Phone number must be exactly 10 digits.",
    }),
  address: z.string().min(5, { message: "Address is required." }),
});

function OcrUploadSection({ customerId }: { customerId: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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
      <h3 className="text-xl font-semibold text-center text-white">Upload RC Book Image</h3>
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={(files) => setFile(files[0] || null)} />
      </div>
      <div className="flex justify-center">
        <button
          disabled={uploading}
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-4 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Submit for OCR"}
        </button>
      </div>
    </div>
  );
}

function page() {
  const [newCustomer, setNewCustomer] = useState<null | {
    id: number;
    name: string;
    phoneNo: string;
    address: string;
    createdAt: string;
  }>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      phoneNo: "",
      address: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/customer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Customer created!", {
          description: result.message,
        });
        setNewCustomer(result.data); // Set newly created customer
      } else {
        toast.error("Error", {
          description: result.message || "Failed to create customer.",
        });
      }
    } catch (err) {
      toast.error("Server Error", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f0f0f] px-4 text-white">
      <div className="w-full max-w-md space-y-6 bg-black p-8 rounded shadow">
        {!newCustomer ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-4">
              Create New Customer
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Raj Tamakuwala" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="7600495969" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Green city, Surat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Create New Customer
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center text-green-400">
              Customer Created Successfully
            </h2>
            <div className="mt-6 bg-neutral-900 rounded-lg shadow-lg p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white">
                <div className="bg-neutral-800 p-4 rounded">
                  <span className="block text-gray-400">Customer ID</span>
                  <span className="font-medium text-lg">{newCustomer.id}</span>
                </div>
                <div className="bg-neutral-800 p-4 rounded">
                  <span className="block text-gray-400">Name</span>
                  <span className="font-medium text-lg">{newCustomer.name}</span>
                </div>
                <div className="bg-neutral-800 p-4 rounded sm:col-span-2">
                  <span className="block text-gray-400">Phone No</span>
                  <span className="font-medium text-lg">{newCustomer.phoneNo}</span>
                </div>
                <div className="bg-neutral-800 p-4 rounded sm:col-span-2">
                  <span className="block text-gray-400">Address</span>
                  <span className="font-medium">{newCustomer.address}</span>
                </div>
                <div className="bg-neutral-800 p-4 rounded sm:col-span-2">
                  <span className="block text-gray-400">Created At</span>
                  <span className="font-medium">
                    {new Date(newCustomer.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <OcrUploadSection customerId={newCustomer.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default page;
