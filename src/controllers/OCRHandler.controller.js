import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

const ocrHandler = asyncHandler(async (req, res) => {
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
      OCREngine: 2,
      isTable: true,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const parsedResult = ocrResponse.data?.ParsedResults?.[0]?.ParsedText;
  if (!parsedResult) {
    throw new ApiError(500, "OCR failed or returned empty text");
  }
  // console.log(parsedResult);
  const extractedJson = parseRCStatusText(parsedResult);
  
  


  return res
    .status(200)
    .json(new ApiResponse(200, extractedJson, "OCR processed successfully"));
});

export { ocrHandler };
