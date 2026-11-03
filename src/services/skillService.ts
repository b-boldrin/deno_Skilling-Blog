import SkillData from "../types/SkillData"

import * as userRepository from "../repositories/skillRepository.ts";

export const getAllSkills = async () => {
    console.log("Rodando GetAll - Service")
  return await userRepository.findAll();
};

export const createSkill = async (skillData : SkillData) => {
  return await userRepository.create(skillData);
};