import express, { Request, Response, NextFunction } from 'express'
import prisma from '../database';
import { createError } from '../utils/middleware/errorHandler';
import { userRequired, adminRequired } from '../utils/middleware/roleCheck';
import { userProfileSchema } from '../types/userTypes';

const router = express.Router();

router.post('/', userRequired, async(req: Request, res: Response, next: NextFunction) => {
    const isValid = userProfileSchema.safeParse(req.body);
    if (!isValid.success) {
        next(new createError("Invalid request body", 400));
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

    res.status(200).json({
        message: "User profile created successfully",
        user
    })
})

router.get('/', userRequired, async(req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.userProfile.findMany();
    res.status(200).json({
        message: "Users fetched successfully",
        users
    })
})

router.get('/:id', userRequired, async(req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
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

router.put('/:id', userRequired, async(req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
        next(new createError("User id is required", 400));
        return;
    }
    const id = +req.params.id;
    const isValid = userProfileSchema.safeParse(req.body);
    if (!isValid.success) {
        next(new createError("Invalid request body", 400));
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

router.delete('/:id', adminRequired, async(req: Request, res: Response, next: NextFunction) => {
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