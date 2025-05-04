import  asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import  supabase  from "../db/dbConnect.js";
import {
  genereateAccessToken,
  genereateRefreshToken,
} from "../utils/generateTokens.js";

const registerAdmin = asyncHandler(async (req, res) => {

    // Get Data from request body
    // Check all required fields are present
    // check if user id email already exists
    // Hash password
    // Generate access and refresh tokens
    // Insert user into database
    // Remove password and tokens from response
    // Send success response


  const { email, name, password } = req.body;

  console.log(req.body)
  if (!email || !name || !password) {
    throw new ApiError(400, "Please provide all fields");
  }

  

  const { data: existingUser } = await supabase
    .from("admin")
    .select("email")
    .eq("email", email)
    .single();
  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(password, saltRound);

  const adminData = { email, name };
  const accessToken = await genereateAccessToken(adminData);
  const refreshToken = await genereateRefreshToken(adminData);

  const { data: newAdmin, error: createdError } = await supabase
    .from("admin")
    .insert([
      {
        email,
        password: hashedPassword,
        name,
        refreshToken,
        accessToken,
        createdAt: new Date(),
      },
    ])
    .select()
    .single();

  if (createdError) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  const adminResponse = { ...newAdmin };
  delete adminResponse.password;
  delete adminResponse.refreshToken;
  delete adminResponse.accessToken;

  res
    .status(200)
    .json(new ApiResponse(200, adminResponse, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        throw new ApiError(400, "Please provide all fields");
    }   

    const {data: admin, error} = await supabase
        .from("admin")
        .select('*')
        .eq("email", email)
        .single();

    if(error || !admin) {
        throw new ApiError(401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if(!validPassword) {
        throw new ApiError(401, "Invalid credentials");
    }

    const adminData = {email, name : admin.name};
    const accessToken = await genereateAccessToken(adminData);
    const refreshToken = await genereateRefreshToken(adminData);

    const { error: updateError } = await supabase
    .from('admin')
    .update({
      refreshToken,
      accessToken
    })
    .eq('email', email);

    if(updateError) {
        throw new ApiError(500, "Something went wrong while updating user");
    }
    const adminResponse = { ...admin };
    delete adminResponse.password;
    delete adminResponse.refreshToken;      
    delete adminResponse.accessToken;

    const options = {
        httpOnly: true,
        secure: true,
      };

    
    res.status(200)
    .cookie("accessToken", String(accessToken), options)
    .cookie("refreshToken", String(refreshToken), options)
    .json(   
        new ApiResponse(200, adminResponse, "Admin logged in successfully")
    );
})


export { registerAdmin, loginAdmin };
