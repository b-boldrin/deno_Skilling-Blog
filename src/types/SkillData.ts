
import type { Types } from "npm:mongoose";

export default interface SkillData {
    _id?: string | Types.ObjectId;
    author?: string;
    authorId?: string;
    title?: string;
    content: string;
    tags: string[];
    isPublic?: boolean;
}



