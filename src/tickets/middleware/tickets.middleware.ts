import { debug } from 'debug';
import express from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { UserRole } from '../../common/middleware/common.permissionflag.enum';
import ticketService from '../services/tickets.serviceImpl';

const log: debug.IDebugger = debug('app:tickets-middleware');

class TicketsMiddleware {
   
    async extractTicketId(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        req.body.id = req.params.ticketId;
        next();
    }

    async validateTicketExists(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if(isValidObjectId(req.params.ticketId)) {
            const ticket = await ticketService.readById(req.params.ticketId);
            if (ticket) {
                res.locals.ticket = ticket;
                next();
            } else {
                res.status(404).send({
                    errors: [`Ticket ${req.params.ticketId} not found`],
                });
            }
        } else {
            res.status(400).send({
                errors: ['Invalid request'],
            });
        }
       
    }
    async validateTicketBelongToUserOrIsStaffOrAdmin(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const userPermissionFlags = parseInt(res.locals.jwt.role);
        const ticket = res.locals.ticket;
       
        const userId = ticket.createdByUser._id.toString();
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

export default new TicketsMiddleware();
