
import mongoose from "mongoose";
const skillSchema = new mongoose.Schema({
   
    
    tags : {
        type: [String],
        require: true
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