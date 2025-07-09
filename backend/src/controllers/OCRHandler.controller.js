import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import supabase from "../db/dbConnect.js";

// Optional: Basic key-value line parser
function parseRCStatusText(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const json = {
    rc_status: {},
    validity: {},
    Insurance_Details: {
      Company: "",
      Validity: "",
      Policy_No: "",
    },
    Permit_Details: {},
    financed: false,
    CNG_Hydro_Testing_Certificate_Details: {},
  };

  let section = "";

  lines.forEach((line, index) => {
    if (!line) return;

    if (line.includes("Status:")) {
      const [reg, statusPart] = line.split("Status:");
      json.rc_status.registration_number = reg.trim().split(" ").pop();
      json.rc_status.status = statusPart.trim();
      section = "rc_status";
    } else if (line.includes("Three Wheeler")) {
      json.rc_status.vehicle_type = line;
    } else if (line.includes("Fuel:")) {
      const fuelMatch = line.match(/Fuel:\s*(.+?)\s+Emission/);
      const emissionMatch = line.match(/Emission norms:\s*(.+)$/);
      if (fuelMatch) json.rc_status.fuel = fuelMatch[1].trim();
      if (emissionMatch)
        json.rc_status.emission_norms = emissionMatch[1].trim();
    } else if (line.startsWith("RE ")) {
      json.rc_status.model = line.trim();
    } else if (line.includes("BAJAJ AUTO")) {
      json.rc_status.manufacturer = line;
    } else if (line.startsWith("#")) {
      json.rc_status.location = line;
    } else if (line.includes("Owner Name:")) {
      const ownerMatch = line.match(/Owner Name:\s*(.*?)\s+Registration Date:/);
      const dateMatch = line.match(/Registration Date:\s*(\d{2}-\w{3}-\d{4})/);
      if (ownerMatch) json.rc_status.owner_name = ownerMatch[1].trim();
      if (dateMatch) json.rc_status.registration_date = dateMatch[1].trim();
    } else if (line.includes("Fitness/REGN:")) {
      const fitnessMatch = line.match(/Fitness\/REGN:\s*(\S+)/);
      const mvTaxMatch = line.match(/MV Tax:\s*(\S+)/);
      if (fitnessMatch) json.validity.fitness_regn = fitnessMatch[1];
      if (mvTaxMatch) json.validity.mv_tax = mvTaxMatch[1];
    } else if (line.startsWith("PUCC:")) {
      json.validity.pucc = line.split(":")[1]?.trim();
    } else if (line.startsWith("Company:")) {
      const nextLine = lines[index + 1];
      if (nextLine) json.Insurance_Details.Company = nextLine.trim();
    } else if (line.startsWith("Validity:")) {
      const nextLine = lines[index + 1];
      if (nextLine) json.Insurance_Details.Validity = nextLine.trim();
    } else if (line.startsWith("Policy No:")) {
      const nextLine = lines[index + 1];
      if (nextLine) json.Insurance_Details.Policy_No = nextLine.trim();
    } else if (line.includes("Permit Details")) {
      section = "permit";
    } else if (
      section === "permit" &&
      line.includes("Contract Carriage Permit")
    ) {
      json.Permit_Details.type =
        "Contract Carriage Permit [AUTO RIKSHAW PERMIT]";
    } else if (section === "permit" && line.includes("Permit No")) {
      const match = line.match(/Permit No:\s*(\S+)\s+Valid upto:\s*(\S+)/);
      if (match) {
        json.Permit_Details.permit_no = match[1];
        json.Permit_Details.valid_upto = match[2];
      }
    } else if (line.toLowerCase().startsWith("financed")) {
      json.financed = line.toUpperCase().includes("YES");
    } else if (line.includes("CNG Hydro Testing Certificate Details")) {
      section = "cng";
    } else if (line.includes("CNG Hydro Testing Certificate Details")) {
      section = "cng";
    } else if (section === "cng" && line.includes("Rudra Energy")) {
      const nextLine = lines[index + 1] || "";
      const prevLine = lines[index - 1] || "";

      // Build company name
      const companyName = (prevLine + " Rudra Energy " + nextLine)
        .replace(/\s+/g, " ")
        .trim();

      // Find where "Rudra Energy" starts in line
      const rudraIndex = line.indexOf("Rudra Energy");

      // Split left and right parts manually
      const leftPart = line.slice(0, rudraIndex).trim(); // should be SI.No, e.g. "1"
      const rightPart = line.slice(rudraIndex + "Rudra Energy".length).trim();

      // Now split rightPart on spaces to get certificate no etc.
      const dataParts = rightPart.split(/\s+/);

      if (dataParts.length >= 4) {
        json.CNG_Hydro_Testing_Certificate_Details = {
          Company_Name: companyName,
          Testing_Certificate_No: dataParts[0], // this should be "G57753/2024/26970"
          Next_Test_Due: dataParts[2], // this should be "05/12/2027"
        };
      }
    }
  });

  return json;
}

//Date converter
// function convertToSupabaseDate(inputDate) {
//   if (!inputDate) return null;

//   const [day, monthStr, year] = inputDate.split("-");
//   const months = {
//     Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
//     Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
//   };

//   const month = months[monthStr];
//   if (month === undefined || isNaN(day) || isNaN(year)) {
//     console.warn("Invalid date format received:", inputDate); // helpful debug log
//     return null;
//   }

//   const date = new Date(year, month, day);
//   return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
// }

function convertToSupabaseDate(inputDate) {
  if (!inputDate) return null;

  // Handle DD/MM/YYYY format
  if (inputDate.includes("/")) {
    const [day, month, year] = inputDate.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }

  // Handle DD-MMM-YYYY format (e.g. 05-Dec-2027)
  const [day, monthStr, year] = inputDate.split("-");
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const month = months[monthStr];
  if (month === undefined || isNaN(day) || isNaN(year)) {
    console.warn("Invalid date format received:", inputDate);
    return null;
  }

  const date = new Date(year, month, parseInt(day));
  return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
}


const ocrHandler = asyncHandler(async (req, res) => {
  // get image from req.file
  // check image path is proper or not
  // uplaod image on cloudinary
  // check image url from response
  // apply ocr to convert image to text
  // convert text to json formate
  // check all fields are present in json if not set that data as null
  // store ocr data in OCR Data table
  // store data in db RC Book table

  const { id } = req.body;

  if (!id) {
    throw new ApiError(400, "CustomerId is not provided");
  }
  console.log(id);
  const rcBookLocalPath = req.file;
  if (!rcBookLocalPath) {
    throw new ApiError(400, "Please provide a file");
  }

  const rcBook = await uploadOnCloudinary(rcBookLocalPath.path);
  if (!rcBook) {
    throw new ApiError(500, "Error uploading file to cloudinary");
  }

  const imageUrl = rcBook.url;
  if (!imageUrl) {
    throw new ApiError(500, "Error getting file url");
  }

  const ocrApiKey = process.env.OCR_SPACE_API_KEY;
  const ocrResponse = await axios.post(
    "https://api.ocr.space/parse/image",
    new URLSearchParams({
      apikey: ocrApiKey,
      url: imageUrl,
      language: "eng",
      isOverlayRequired: "false",
      scale: true,
      // OCREngine: 2,
      isTable: true,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const parsedResult = ocrResponse.data?.ParsedResults?.[0]?.ParsedText;
  // console.log(parsedResult)
  if (!parsedResult) {
    throw new ApiError(500, "OCR failed or returned empty text");
  }
  // console.log(parsedResult);
  const extractedJson = parseRCStatusText(parsedResult);
  // console.log(extractedJson)

  const newRegDate = convertToSupabaseDate(extractedJson.rc_status.registration_date)
  const newFitnessExpDate = convertToSupabaseDate(extractedJson.validity.fitness_regn)
  const newPuccExpDate = convertToSupabaseDate(extractedJson.validity.pucc)
  const newInsuranceExpDate = convertToSupabaseDate(extractedJson.Insurance_Details.Validity)
  const newPermitExpDate = convertToSupabaseDate(extractedJson.Permit_Details.valid_upto)
  const newCertificateExpDate = convertToSupabaseDate(extractedJson.CNG_Hydro_Testing_Certificate_Details.Next_Test_Due)

  const data = {
    vehicleNo: extractedJson.rc_status.registration_number ?? null,
    registrationDate: newRegDate ?? null,
    fitnessExpDate: newFitnessExpDate ?? null,
    puccExpDate: newPuccExpDate ?? null,
    insuranceCompName: extractedJson.Insurance_Details.Company ?? null,
    insuranceExpDate: newInsuranceExpDate ?? null,
    policyNo: extractedJson.Insurance_Details.Policy_No ?? null,
    permitNo: extractedJson.Permit_Details.permit_no ?? null,
    permitExpDate: newPermitExpDate ?? null,
    certificateNo:
      extractedJson.CNG_Hydro_Testing_Certificate_Details
        .Testing_Certificate_No ?? null,
    certificateExpDate: newCertificateExpDate ?? null,
  };
  // console.log(data)

  console.log("Insert payload: ", {
  customerId: Number(id),
  ...data,
  imageUrl,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

  const { data: RcDetails, error: RcError } = await supabase
    .from("RC Book")
    .insert([
      {
        customerId: Number(id),
        vehicleNo: data.vehicleNo,
        registrationDate: data.registrationDate,
        fitnessExpDate: data.fitnessExpDate,
        puccExpDate: data.puccExpDate,
        insuranceCompName: data.insuranceCompName,
        insuranceExpDate: data.insuranceExpDate,
        policyNo: data.policyNo,
        permitNo: data.permitNo,
        permitExpDate: data.permitExpDate,
        certificateNo: data.certificateNo,
        certificateExpDate: data.certificateExpDate,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]).select();

  if (RcError) {
      console.error("Supabase Insert Error:", RcError);
      throw new ApiError(500, `Database Insert Error: ${RcError.message || RcError.details || "Unknown error"}`);
    }
  console.log("Successfully inserted:", RcDetails);

    const {data: OCRData, errror: OCRError} = await supabase
    .from('OCR Data')
    .insert([{
      vehicleId: data.vehicleNo,
      data: parsedResult,
      createdAt: new Date().toISOString()
    }])

    if(OCRError) {
      console.error("Supabase Insert Error:", RcError);
      throw new ApiError(500, `Database Insert Error: ${RcError.message || RcError.details || "Unknown error"}`);
    }

    console.log("OCRData added successfully.")

  return res
    .status(200)
    .json(new ApiResponse(200, extractedJson, "OCR processed successfully"));
});

export { ocrHandler };
