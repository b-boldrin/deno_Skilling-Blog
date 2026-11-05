export default interface sendSkillData {
     tags : string[], 
     content: string,
}


export default interface getSkillData {
     _id : string,
     tags : string[], 
     content: string, 
     authorId: string
}