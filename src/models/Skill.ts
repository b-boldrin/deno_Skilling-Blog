
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

     
    content : {
        type: String,
        require: true
    },

    author : {
        type: String,
        require: true
    }

    

}, {timestamps:true})

const Skill = mongoose.model('Skill', skillSchema)

export default Skill