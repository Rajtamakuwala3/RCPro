import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { subtle } from "crypto";
import supabase from "../db/dbConnect.js";

const NewCustomerHandler = asyncHandler(async (req, res) => {
  // get name, phoneNo, address from req.body
  // verfiy  name, phoneNo, address
  // CREATE SEQUENCE customer_id_seq START 10000001;
  // get client unieue id and store in DB
  // check stoed or not
  // send response

  const { name, phoneNo, address } = req.body;
  console.log(req.body)

  if (!name || !phoneNo || !address) {
    throw new ApiError(400, "Name, phooneNo and address are required fields");
  }

  const { data: response, error: createdError } = await supabase
    .from("customer")
    .insert([
      {
        name,
        phoneNo,
        address,
        createdAt: new Date(),
      },
    ])
    .select()
    .single();

    // const newCustomer = {...response}
    // delete newCustomer.id;

    if(createdError) {
        throw new ApiError(500, "Someting went wrong while creating new customer")
    }

    res.status(200)
    .json(new ApiResponse(200, response,"New customer created successfully"))

});

const ExistingCustomerHandler = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 1) {
    return res.status(200).json(new ApiResponse(200, [], "Empty search query"));
  }

  const { data, error } = await supabase
  .from("customer")
  .select("id, name, phoneNo")
  .ilike("name", `%${q}%`)
  .limit(10); // Case-insensitive partial match

  if (error) {
    throw new ApiError(500, "Error fetching customer suggestions");
  }

  return res.status(200).json(
    new ApiResponse(200, data, "Suggestions fetched successfully")
  );
})

export {NewCustomerHandler, ExistingCustomerHandler}
