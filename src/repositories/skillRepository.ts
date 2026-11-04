import Skill from "../models/Skill.ts";
import sendSkillData from "../types/SkillData";
import getSkillData from "../types/SkillData";







export const findAll = async (page? : number) => {

    if (!page) {
        page = 1
    }

    const limit = 20

    const skills = await Skill.find().sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

    console.log(skills)


    

    return skills

// return await User.find();
};

export const create = async (skillData : sendSkillData) => {
    const newSkill = new Skill(skillData);

    return await newSkill.save();
};

export const remove = async (skillData : getSkillData) => {
    const deletedSkill = await Skill.deleteOne({_id: skillData._id});

    return deletedSkill;
};








  

//     const newSkill = await Skill.create({
//   "content": "Desenvolvimento de APIs REST utilizando Node.js, Express e MongoDB com Mongoose. Conhecimento em criação de rotas, controllers, models, autenticação JWT e operações CRUD.",
// "tags": ["JavaScript", "Node.js", "MongoDB", "Backend"],
//   "author": "João Silva"
// })
