import User from "../models/User.ts";
import mongoose from "mongoose"
import type UpdatePasswordData from "../types/UpdatePasswordData.ts";
import type {UserPasswordData} from "../types/UserPasswordData.ts"
import type UserData from "../types/UserData.ts";


export const findAll = async (page? : number) => {

    if (!page) {
        page = 1
    }

    const limit = 20

    const users = await User.find({},{username: 1, _id:0}).sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

    return users

};


export const create = async (
    userData: UserData, session? : mongoose.mongo.ClientSession
): Promise<{ _id: mongoose.Types.ObjectId; username: string; email: string } | false> => {
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
        return false;
    }

    const newUser = new User(userData);
    session ? await newUser.save({session}) : await newUser.save();

    return {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email
    };
};
export const removeById = async (id : string, session? : mongoose.mongo.ClientSession) => {
    const deletedUser = session ? await User.deleteOne({_id: id}, {session}) :  await User.deleteOne({_id: id})

    return deletedUser;
};


export const getByEmail = async (email: string) => {;

    return await User.findOne({ email }).select('+password');
};

export const getLastPasswordByIdAndEmail = async (id: string, email: string) : Promise<UserPasswordData | null>=> {
    
    return await User.findOne({ _id: id, email: email }).select('+password'); 

}


export const updatePassword = async (userData : UpdatePasswordData) => {

    const updatedUser = await User.updateOne({_id: userData._id, email: userData.email }, { $set: { password: userData.password } });

    return Boolean(updatedUser.modifiedCount);
};
