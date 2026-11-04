import UserData from "../types/UserData.ts";
import bcrypt from 'bcrypt';


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

  return await userRepository.create(userData)
};

export const removeUserById = async (id : string) => {
  return await userRepository.removeById(id);
};


export const updateUserPassword = async (userData : { email: string; password: string; lastPassword: string; _id: string }) => {

  const lastPassword = await userRepository.getLastPasswordByIdAndEmail(userData._id!, userData.email);
  
  if (!lastPassword) {
      throw new Error("Usuário não encontrado");
  }
  

  console.log(lastPassword.password)
  console.log(userData.lastPassword)

  const isSamePassword = await bcrypt.compare(userData.lastPassword!, lastPassword.password);
  console.log("000")
  if (!isSamePassword) {
    throw new Error("A senha antiga não confere");
  }
  console.log("aaa")
  

  const isSameAsLastPassword = await bcrypt.compare(userData.password, lastPassword.password);
  
  console.log(isSameAsLastPassword)
  console.log(userData.lastPassword, userData.password)

  if (isSameAsLastPassword) {
      throw new Error("A nova senha não pode ser igual a senha antiga");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  userData.password = hashedPassword;

  return await userRepository.updatePassword(userData);

};




