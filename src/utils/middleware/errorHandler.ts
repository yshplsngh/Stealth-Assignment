import { ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { zodErrorToString } from "../zodErrorToString";

interface handleErrorType {
    message: string;
    code: number;
    uncaught?: string;
}

class createError extends Error {
    code: number;
    constructor(message: string, code: number = 500) {
        super(message);
        this.code = code;
    }
}

function handleError({
    _error,
    uncaught,
}: {
    _error: unknown;
    uncaught?: boolean;
}): handleErrorType {

    let error: { message: string; code: number; uncaught?: string } = {
        message: 'Unexpected error has occurred',
        code: 500,
    };

    if (typeof _error === 'string') {
        error = new createError(_error);
    }else if (_error instanceof createError) {
        error = { code: _error.code, message: _error.message };
    }else if (_error instanceof ZodError) {
        error = { code: 400, message: zodErrorToString(_error) };
    }else if (_error instanceof Error) {
        error = { code: 500, message: _error.stack || 'Unknown error' };
    }
    if (uncaught) {
        error = {
            ...error,
            uncaught:
                'uncaught exception or unhandled rejection, Node process finished !!',
        };
    }
    return error;
}

function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    next: NextFunction,
) {
    const { message, code, ...rest } = handleError({ _error: error });

    res.status(code).json({ message: message, ...rest });
    next();
}

const uncaughtExceptionHandler = async (error: unknown) => {
    const uncaughtError = handleError({ _error: error, uncaught: true });
    console.log(uncaughtError);
    process.exit(1);
}

export { uncaughtExceptionHandler, errorHandler, handleError , createError};