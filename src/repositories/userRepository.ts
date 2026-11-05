import User from "../models/User.ts";
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

    console.log(users)
    

    return users

// return await User.find();
};

export const create = async (userData : UserData) => {

    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
   return false
}

    const newUser = new User(userData);
    await newUser.save();
    return newUser;
};

export const removeById = async (id : string) => {
    const deletedUser = await User.deleteOne({_id: id});

    return deletedUser;
};


export const getByEmail = async (email: string) => {;

    return await User.findOne({ email }).select('+password');
};

export const getLastPasswordByIdAndEmail = async (id: string, email: string) => {
    
    return await User.findOne({ _id: id, email: email }).select('+password'); 

}


export const updatePassword = async (userData : UserData) => {

    const updatedUser = await User.updateOne({_id: userData._id, email: userData.email }, { $set: { password: userData.password } });

    return Boolean(updatedUser.modifiedCount);
};
