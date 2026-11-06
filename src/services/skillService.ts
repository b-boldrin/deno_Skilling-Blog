import SkillData from "../types/SkillData.ts"
import * as skillRepository from "../repositories/skillRepository.ts";
import mongoose from "mongoose"

type SkillRepository = typeof skillRepository;

export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ForbiddenError";
    }
}

export const createSkillService = ( 
  repository: Partial<Pick<
        SkillRepository,
        | "findAllByUserId"
        | "findAllPublic"
        | "findSkillById"
        | "create"
        | "remove"
        | "update"
        | "removeMany"
    >> = skillRepository) => {

    const getAllMySkills = async (userId: string, page?: number) => {
        
      return await repository.findAllByUserId!(userId, page);
    };

    const getAllPublicSkills = async (page?: number) => {
        
      return await repository.findAllPublic!(page);
    };

    const createSkill = async (skillData : SkillData, session? : mongoose.mongo.ClientSession) => {
      return await repository.create!(skillData, session);
    };

    const removeSkill = async (skillData : SkillData) => {
      return await repository.remove!(skillData);
    };

    const deleteAllSkillsForAuthorId = async (authorId : string, session? : mongoose.mongo.ClientSession) => {
      return await repository.removeMany!(authorId, session);
    };

    const updateSkill = async (skillData : SkillData) => {  
      return await repository.update!(skillData);
    } 

    const findSkillById = async (skillId : mongoose.Types.ObjectId) => {  

      return await repository.findSkillById!(skillId);
    } 

    return {
        getAllMySkills,
        getAllPublicSkills,
        createSkill,
        removeSkill,
        updateSkill,
        findSkillById,
        deleteAllSkillsForAuthorId
    }
  }

const skillService = createSkillService()

export default skillService