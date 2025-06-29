import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import  supabase  from '../db/dbConnect.js'; // Make sure the path is correct
import dotenv from 'dotenv';

dotenv.config();

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return next(new ApiError(401, 'Access denied. No token provided.'));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const { data: admin, error } = await supabase
            .from('admin')
            .select('email, accessToken')
            .eq('email', decoded.email)
            .single();

        if (error || !admin || admin.accessToken !== accessToken) {
            return res.status(401).json(new ApiResponse(401, null, 'Invalid token or session expired'));
        }

        req.admin = decoded;
        next();
    } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
            return res.status(401).json(new ApiResponse(401, null, 'Token expired'));
        }

        next(new ApiError(401, 'Unauthorized token'));
    }
});


