import UserData from "../types/UserData.ts";
import * as userRepository from "../repositories/userRepository.ts";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



export const checkLogin = async (userData : UserData) => {
  

    const user = await userRepository.getByEmail(userData.email);

    if (!user) {
        return false;
    }
    
    const isPasswordValid = await bcrypt.compare(userData.password, user.password);

    const token = jwt.sign({ id: user._id.toString() }, Deno.env.get("JWT_SECRET")!, { expiresIn: '15m' });


    return { isPasswordValid, token };

};




