import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.ts";




export const createUser = async (req: Request, res: Response, next: NextFunction) => {


    try {

        const newUser = await userService.createUser(req.body)

        if (newUser === false) {

            return next(res.err_conflict("E-mail ou username já cadastrado"));

        }

        res.send_created(newUser);

    } catch (err : any) {
        if (err.code === 11000) {
            return next(res.err_conflict("E-mail ou username já cadastrado"));
        }
        
        return next(res.err_internal(err));
    }
    
};

export const deleteHimselfUser = async (req: Request, res: Response, next: NextFunction) => {
    
};


export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    
};


export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const users = await userService.getAllUsers();
        
        res.send_ok("Usuários Encontrados:", users);
    }
    catch (err) {
        return next(res.err_internal("Erro ao buscar usuários"));
    }
    

    
};


