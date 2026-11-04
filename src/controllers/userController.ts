import type { Request, Response } from "express";
import * as userService from "../services/userService.ts";




export const createUser = async (req: Request, res: Response) => {


    try {

        const newUser = await userService.createUser(req.body)

        if (newUser === false) {
            return res.status(400).json({
                success: false,
                message: 'E-mail ou username já cadastrado'
            });
        }

        res.send_created(newUser);

    } catch (err : any) {
        if (err.code === 11000) {
            return res.status(409).json({
            success: false,
            message: 'E-mail ou username já cadastrado'
            });
        }
        
        const error = err as Error;
        res.status(500).json({ error: error.message });
    }
    
};

export const deleteHimselfUser = async (req: Request, res: Response) => {
    
};


export const updateUser = async (req: Request, res: Response) => {
    
};


export const getAllUsers = async (req: Request, res: Response) => {
    
};


