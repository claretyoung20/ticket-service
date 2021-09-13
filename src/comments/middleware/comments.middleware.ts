import { debug } from 'debug';
import express from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { UserRole } from '../../common/middleware/common.permissionflag.enum';
import commentService from '../services/comments.serviceImpl';

const log: debug.IDebugger = debug('app:comments-middleware');

class CommentsMiddleware {
   
    async extractCommentId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.commentId;
        next();
    }

    async validateCommentExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if(isValidObjectId(req.params.commentId)) {
            const comment = await commentService.readById(req.params.commentId);
            if (comment) {
                res.locals.comment = comment;
                next();
            } else {
                res.status(404).send({
                    errors: [`Comment ${req.params.commentId} not found`],
                });
            }
        } else {
            res.status(404).send({
                errors: ['Invalid request'],
            });
        }
        
    }
    async validateCommentBelongToUserOrStaffAndAdmin(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const userPermissionFlags = parseInt(res.locals.jwt.role);
        const comment = res.locals.comment;
       
        const userId = comment.createdByUser._id.toString();
        const jwtUserId = new Types.ObjectId(res.locals.jwt.userId)._id.toString();

        if(jwtUserId === userId) {
            next()
        } else if(userPermissionFlags === UserRole.ADMIN || userPermissionFlags === UserRole.STAFF) {
            next();
        } else {
            res.status(403).send({
                message: 'Failed',
                errors: ['Unauthorized request'],
            });
        }

    }
}

export default new CommentsMiddleware();
