import UserData from "../types/UserData.ts";
import bcrypt from 'npm:bcrypt';


import * as userRepository from "../repositories/userRepository.ts";

export const getAllUsers = async () => {
    
  return await userRepository.findAll();
};


export const getUser = async (userData : UserData) => {
    const user = await userRepository.getByEmail(userData.email);
    
    if (!user) {
        return false;
    } 

    return user;
}



export const createUser = async (userData : UserData) => {

  
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  userData.password = hashedPassword;

  return await userRepository.create(userData);
};

export const removeUser = async (userData : UserData) => {
  return await userRepository.remove(userData);
};

