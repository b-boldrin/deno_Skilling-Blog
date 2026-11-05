
import type { Types } from "npm:mongoose";

interface SkillData {
    _id?: string | Types.ObjectId;
    author?: string;
    authorId?: string;
    title?: string;
    content: string;
    tags: string[];
    isPublic?: boolean;
}



export default interface sendSkillData extends SkillData {}


export default interface getSkillData extends SkillData {}


