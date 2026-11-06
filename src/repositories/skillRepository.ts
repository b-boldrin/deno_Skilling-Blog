import Skill from "../models/Skill.ts";
import sendSkillData from "../types/SkillData.ts";
import getSkillData from "../types/SkillData.ts";
import mongoose from "mongoose"

export const findAllByUserId = async (userId: string, page?: number) => {

    if (!page) {
        page = 1
    }

    const limit = 20

    const skills = await Skill.find({author: userId}, {__v: 0, createdAt: 0, content: 0}).sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

    return skills
};




export const getSkillById = async (_id: string) => {;

    return await Skill.findOne({ _id }).populate('author', '_id');
};


export const findAllPublic = async (page?: number) => {

    if (!page) {
        page = 1
    }

    const limit = 20

    const skills = await Skill.find({isPublic: true}, {__v: 0, createdAt: 0, content: 0}).populate('author', 'username').sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

    return skills
};


export const create = async (skillData : sendSkillData, session? : mongoose.mongo.ClientSession) => {
    const newSkill = new Skill(skillData);

    session ? await newSkill.save({session}) : await newSkill.save();

    return newSkill;
};

export const remove = async (skillData : getSkillData) => {
    const deletedSkill = await Skill.deleteOne({_id: skillData._id, author: skillData.authorId});

    return deletedSkill;
};

export const update = async (skillData : getSkillData) => {
    const updatedSkill = await Skill.updateOne({_id: skillData._id, author: skillData.authorId}, { $set: {title: skillData.title, isPublic: skillData.isPublic || false,  content: skillData.content, tags: skillData.tags } });

    return updatedSkill;
}
