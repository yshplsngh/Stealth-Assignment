import express, { Request, Response, NextFunction } from 'express'
import prisma from '../database';
import { createError } from '../utils/middleware/errorHandler';
import { userRequired, adminRequired } from '../utils/middleware/roleCheck';
import { userProfileSchema } from '../types/userTypes';

const router = express.Router();

/**
 * @route POST /api/users
 * @description Create a new user profile
 * @access Private
 * @body {string} name - The name of the user
 * @body {string} email - The email of the user
 * @body {string} role - The role of the user
 * @returns {"message": "User profile created successfully", "user": {id: number, email: string, name: string, role: string}}
 */
router.post('/', userRequired, async (req: Request, res: Response, next: NextFunction) => {
    const isValid = userProfileSchema.safeParse(req.body);
    if (!isValid.success) {
        next(isValid.error);
        return;
    }
    const emailExists = await prisma.userProfile.findUnique({
        where: { email: isValid.data.email }
    })
    if (emailExists) {
        next(new createError("Email already exists", 400));
        return;
    }
    const user = await prisma.userProfile.create({
        data: isValid.data
    })

    res.status(201).json({
        message: "User profile created successfully",
        user
    })
})

/**
 * @route GET /api/users
 * @description Fetch all user profiles
 * @access Private
 * @returns {"message": "Users fetched successfully", "users": [{id: number, email: string, name: string, role: string}]}
 */
router.get('/', userRequired, async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.userProfile.findMany();
    res.status(200).json({
        message: "Users fetched successfully",
        users
    })
})

/**
 * @route GET /api/users/:id
 * @description Fetch a single user profile
 * @access Private
 * @param {number} id - The id of the user
 * @returns {"message": "User fetched successfully", "user": {id: number, email: string, name: string, role: string}}
 */
router.get('/:id', userRequired, async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || isNaN(Number(req.params.id))) {
        next(new createError("User id is required", 400));
        return;
    }
    const id = +req.params.id;

    const user = await prisma.userProfile.findUnique({
        where: { id: id }
    })
    if (!user) {
        next(new createError("User not found", 404));
        return;
    }
    res.status(200).json({
        message: "User fetched successfully",
        user
    })
})

/**
 * @route PUT /api/users/:id
 * @description Update a user profile
 * @access Private
 * @param {number} id - The id of the user
 * @body {string} name - The name of the user
 * @body {string} email - The email of the user
 * @body {string} role - The role of the user
 * @returns {"message": "User updated successfully", "user": {id: number, email: string, name: string, role: string}}
 */
router.put('/:id', userRequired, async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id || isNaN(Number(req.params.id))) {
        next(new createError("User id is required", 400));
        return;
    }
    const id = +req.params.id;
    const isValid = userProfileSchema.safeParse(req.body);
    if (!isValid.success) {
        next(isValid.error);
        return;
    }
    const user = await prisma.userProfile.update({
        where: { id: id },
        data: isValid.data
    })
    res.status(200).json({
        message: "User updated successfully",
        user
    })
})

/**
 * @route DELETE /api/users/:id
 * @description Delete a user profile
 * @access Private
 * @param {number} id - The id of the user
 * @returns {"message": "User deleted successfully"}
 */
router.delete('/:id', adminRequired, async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
        next(new createError("User id is required", 400));
        return;
    }
    const id = +req.params.id;
    await prisma.userProfile.delete({
        where: { id: id }
    })
    res.status(200).json({
        message: "User deleted successfully"
    })
})

export default router;