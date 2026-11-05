import jwt from "npm:jsonwebtoken";

export const generateTestToken = () => {
    return jwt.sign(
        {
            id: "507f1f77bcf86cd799439011"
        },
        Deno.env.get("JWT_SECRET")!,
        {
            expiresIn: "1h"
        }
    );
};