import commentsService from '../services/comments.serviceImpl';
import express from 'express';
import { debug } from 'debug';
import { CreateCommentDto } from '../dtos/create.comment.dto';
import usersService from '../../users/services/users.serviceImpl';
import { UserRole } from '../../common/middleware/common.permissionflag.enum';

const log: debug.IDebugger = debug('app:comments-controller');

class CommentsController {

    async listComments(req: express.Request, res: express.Response) {
        const comments = await commentsService.list(100, 0);
        res.status(200).send(comments);
    }

    async create(req: express.Request, res: express.Response) {
        let createCommentDto: CreateCommentDto = req.body;
        createCommentDto.commentBy = res.locals.jwt.userId;
        createCommentDto.ticket = res.locals.ticket._id;

        const comments = await commentsService.listAllTicketsComments(createCommentDto.ticket);
        if (comments && comments.length >= 1) {
            const commentId = await commentsService.create(createCommentDto);
            res.status(201).send({ id: commentId });
        } else {
            const user: any = await usersService.readById(res.locals.jwt.userId);
            if (user && user.role !== UserRole.USER) {
                const commentId = await commentsService.create(createCommentDto);
                res.status(201).send({ id: commentId });
            } else {
                res.status(400).send({ message: "Failed", errors: ["Please wait for a staff to reply your complain"] });
            }

        }

    }

    async readById(req: express.Request, res: express.Response) {
        const comments = await commentsService.readById(req.body.id);
        res.status(200).send(comments);
    }

    async listAllTicketsComments(req: express.Request, res: express.Response) {
        const comments = await commentsService.listAllTicketsComments(res.locals.ticket._id);
        res.status(200).send(comments);
    }

}

export default new CommentsController();
