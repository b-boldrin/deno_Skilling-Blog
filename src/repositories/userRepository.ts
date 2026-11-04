import User from "../models/User.ts";
import type UserData from "../types/UserData.ts";


export const findAll = async (page? : number) => {

    if (!page) {
        page = 1
    }

    const limit = 20

    const users = await User.find().sort({createdAt: -1})
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
    return await newUser.save();
};

export const remove = async (userData : UserData) => {
    const deletedUser = await User.deleteOne({_id: userData._id});

    return deletedUser;
};


export const getByEmail = async (email: string) => {;

    return await User.findOne({ email }).select('+password');
};










  

//     const newSkill = await Skill.create({
//   "content": "Desenvolvimento de APIs REST utilizando Node.js, Express e MongoDB com Mongoose. Conhecimento em criação de rotas, controllers, models, autenticação JWT e operações CRUD.",
// "tags": ["JavaScript", "Node.js", "MongoDB", "Backend"],
//   "author": "João Silva"
// })
