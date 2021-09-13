import express from 'express';
import usersService from '../services/users.serviceImpl';
import argon2 from 'argon2';
import debug from 'debug';
import { PatchUserDto } from '../dto/patch.user.dto';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {


    async createUser(req: express.Request, res: express.Response) {
        try {
            req.body.password = await argon2.hash(req.body.password);
            const userId = await usersService.create(req.body);
            res.status(201).send({ id: userId });
        } catch (err: any) {
            log("errors: %0", err);
            let errors: any = alertUserError(err);
            res.status(400).json({ errors });
        }

    }

    async listUsers(req: express.Request, res: express.Response) {
        const users = await usersService.list(100, 0);
        res.status(200).send(users);
    }

    async getUserById(req: express.Request, res: express.Response) {
        const user = await usersService.readById(req.body.id);
        res.status(200).send(user);
    }

    async getCurrentLoggedInUser(req: express.Request, res: express.Response) {
        const user = await usersService.readById(req.body.id);
        res.status(200).send(user);
    }

    async put(req: express.Request, res: express.Response) {
        log(await usersService.putById(req.body.id, req.body));
        res.status(204).send();
    }
 
    async patch(req: express.Request, res: express.Response) {
        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password);
        }
        log(await usersService.patchById(req.body.id, req.body));
        res.status(204).send();
    }

    async updatePermissionFlags(req: express.Request, res: express.Response) {
        const patchUserDto: PatchUserDto = {
            role: parseInt(req.params.role),
        };
        log(await usersService.patchById(req.body.id, patchUserDto));
        res.status(204).send();
    }
}

export default new UsersController();

function alertUserError(err: any) {
    let errors: any = { firstName: '', lastName: '', email: '', password: '' };
    if (err.message.includes('Users validation failed')) {
        Object.values(err.errors).forEach((properties: any) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}
