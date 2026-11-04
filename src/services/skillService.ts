import SkillData from "../types/SkillData"

import * as userRepository from "../repositories/skillRepository.ts";

export const getAllSkills = async () => {
    
  return await userRepository.findAll();
};

export const createSkill = async (skillData : SkillData) => {
  return await userRepository.create(skillData);
};

export const removeSkill = async (skillData : SkillData) => {
  return await userRepository.remove(skillData);
};


