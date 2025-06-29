import asyncHandler from "../utils/asyncHandler.js";
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { subtle } from "crypto";
import supabase from "../db/dbConnect.js";

const customerHandler = asyncHandler(async (req, res) => {
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

    const newCustomer = {...response}
    delete newCustomer.id;

    if(createdError) {
        throw new ApiError(500, "Someting went wrong while creating new customer")
    }

    res.status(200)
    .json(new ApiResponse(200, newCustomer,"New customer created successfully"))

});

export {customerHandler}
