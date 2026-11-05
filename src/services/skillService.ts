import SkillData from "../types/SkillData.ts"

import * as skillRepository from "../repositories/skillRepository.ts";

export const getAllMySkills = async (userId: string, page?: number) => {
    
  return await skillRepository.findAllByUserId(userId, page);
};

export const getAllPublicSkills = async (page?: number) => {
    
  return await skillRepository.findAllPublic(page);
};

export const createSkill = async (skillData : SkillData) => {
  return await skillRepository.create(skillData);
};

export const removeSkill = async (skillData : SkillData) => {
  return await skillRepository.remove(skillData);
};

export const updateSkill = async (skillData : SkillData) => {

  const skillToEdit = await skillRepository.getSkillById(skillData._id)

  if (!skillToEdit) {
    throw new Error("Skill não encontrada");
  }
  
  if (skillToEdit.author._id.toString() !== skillData.authorId) {
    throw new Error("Usuário não autorizado a editar essa skill");
  }
  
  return await skillRepository.update(skillData);
} 