import jwt from 'jsonwebtoken';

const genereateAccessToken = async function (adminData) {
    return jwt.sign(
        {
            email : adminData.email,
            name : adminData.name,
        }
        , process.env.ACCESS_TOKEN_SECRET, {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

const genereateRefreshToken = async function (adminData) {
    return jwt.sign(
        {
            email : adminData.email,
            name : adminData.name,
        }
        , process.env.REFRESH_TOKEN_SECRET, {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export {genereateAccessToken, genereateRefreshToken}

