import SkillData from "../types/SkillData.ts"

import * as skillRepository from "../repositories/skillRepository.ts";

export const getAllSkills = async () => {
    
  return await skillRepository.findAll();
};

export const createSkill = async (skillData : SkillData) => {
  return await skillRepository.create(skillData);
};

export const removeSkill = async (skillData : SkillData) => {
  return await skillRepository.remove(skillData);
};


