
import mongoose from "mongoose";
const skillSchema = new mongoose.Schema({
   
    
    tags : {
        type: [String],
        require: true,
        validate: [
            {validator: (value: string[]) => Array.isArray(value) && value.length > 0,
            message: 'As tags são obrigatórias'},
            {validator: (value: string[]) => value.every(tag => tag.trim().length > 0),
            message: 'As tags não podem ser vazias'}
        ]
    },

    
    tittle : {
        type: String,
        require: true
    },

    content : {
        type: String,
        require: true
    },

    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },

    isPublic: {
        type: Boolean,
        default: false
    }

    

}, {timestamps:true})

const Skill = mongoose.model('Skill', skillSchema)

export default Skill