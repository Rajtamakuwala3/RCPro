import asyncHandler from "../utils/asyncHandler.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import supabase from "../db/dbConnect.js";

const getRCBookByVehicleNo = asyncHandler(async (req, res) => {
  const { vehicleNo } = req.params;

  if (!vehicleNo) {
    throw new ApiError(400, "vehicleNo is required");
  }

  const { data, error } = await supabase
    .from("RC Book")
    .select("*")
    .eq("vehicleNo", vehicleNo)
    .single(); // Since vehicleNo is unique

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new ApiError(
      500,
      `Error fetching RC Book data: ${error.message || error.details}`
    );
  }

  console.log(data)

  const {data: customerData, error: customerError} = await supabase
  .from("customer")
  .select("name, phoneNo")
  .eq("id", data.customerId)
  .single();

  if (customerError) {
    console.error("Supabase customer fetch error:", customerError);
    throw new ApiError(
      500,
      `Error fetching customer data: ${customerError.message}`
    );
  }

  console.log(customerData)

  const mergedData = {
    ...data,
    customerId: data.customerId,
    customerName: customerData.name,
    customerPhoneNo: customerData.phoneNo,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, mergedData, "RC Book data retrieved successfully"));
});

const searchByInsuranceMonth = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(
      400,
      "Month and Year are required to fetch Insurance data"
    );
  }

  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const endDateObj = new Date(year, parseInt(month), 0); // last day of month
  const endDate = endDateObj.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("RC Book")
    .select(`
      *,
      customer:customerId (
        name,
        phoneNo
      ) 
      `)
    .gte("insuranceExpDate", startDate)
    .lte("insuranceExpDate", endDate);

  if (error) {
    throw new ApiError(
      500,
      `Something went wrong while fetching Insurance Data: ${error.message}`
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        `Insurance data fetched successfully for ${month} and ${year}.`
      )
    );
});

const searchByFitnessExpMonth = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(
      400,
      "Month and Year are required to fetch Insurance data"
    );
  }

  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const endDateObj = new Date(year, parseInt(month), 0); // last day of month
  const endDate = endDateObj.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("RC Book")
    .select(`
      *,
      customer:customerId (
        name,
        phoneNo
      ) 
      `)
    .gte("fitnessExpDate", startDate)
    .lte("fitnessExpDate", endDate);

  if (error) {
    throw new ApiError(
      500,
      `Something went wrong while fetching Fitenss Data: ${error.message}`
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        `Fitenss data fetched successfully for ${month} and ${year}.`
      )
    );
});

const searchByCylinderExpMonth = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    throw new ApiError(
      400,
      "Month and Year are required to fetch Insurance data"
    );
  }

  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const endDateObj = new Date(year, parseInt(month), 0); // last day of month
  const endDate = endDateObj.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("RC Book")
    .select("*")
    .gte("certificateExpDate", startDate)
    .lte("certificateExpDate", endDate);

  if (error) {
    throw new ApiError(
      500,
      `Something went wrong while fetching Cylinder Data: ${error.message}`
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        `Cylinder data fetched successfully for ${month} and ${year}.`
      )
    );
});

export {
  getRCBookByVehicleNo,
  searchByInsuranceMonth,
  searchByFitnessExpMonth,
  searchByCylinderExpMonth,
};
