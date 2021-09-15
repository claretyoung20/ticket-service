import { Application } from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import express from 'express';
import TicketsController from "./controllers/tickets.controller";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";
import TicketsMiddleware from "./middleware/tickets.middleware";
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import { UserRole } from "../common/middleware/common.permissionflag.enum";
import commentsController from "../comments/controllers/comments.controller";

export class TicketsRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, 'TicketsRoutes');
    }

    configureRoutes(): Application {
        this.app
            .route(`/tickets`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([UserRole.STAFF,  UserRole.ADMIN]),
                TicketsController.listTickets
            )
            .post(
                body('department').isString(),
                body('priority').isString(),
                body('subject').isString(),
                body('ticketMessage').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                jwtMiddleware.validJWTNeeded,
                TicketsController.createTicket
            )
            
            this.app
            .route(`/tickets/download/csv`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([UserRole.STAFF]), // todo test staff
                TicketsController.listAllClosedTicketInOneMonth
            )

        this.app.param(`ticketId`, TicketsMiddleware.extractTicketId);
        this.app
            .route(`/tickets/:ticketId`)
            .all(
                TicketsMiddleware.validateTicketExists,
                jwtMiddleware.validJWTNeeded,
            )
            .get(
                TicketsMiddleware.validateTicketBelongToUserOrIsStaffOrAdmin,
                TicketsController.getTicketById)

            this.app.put(`/tickets/:ticketId/close`, [
                jwtMiddleware.validJWTNeeded,
                TicketsMiddleware.validateTicketExists,
                TicketsMiddleware.validateTicketBelongToUserOrIsStaffOrAdmin,
                TicketsController.closeTicket,
            ]);

            this.app.put(`/tickets/:ticketId/reopen`, [
                jwtMiddleware.validJWTNeeded,
                TicketsMiddleware.validateTicketExists,
                permissionMiddleware.permissionFlagRequired([UserRole.USER]),
                TicketsController.reOpenTicket
            ]);

            // COMMENTS
            this.app
            .route(`/tickets/:ticketId/comments`)
            .all(
                jwtMiddleware.validJWTNeeded,
                TicketsMiddleware.extractTicketId,
                TicketsMiddleware.validateTicketExists,
                TicketsMiddleware.validateTicketBelongToUserOrIsStaffOrAdmin
            )
            .get(TicketsController.listAllComments)
            .post(
                body('comment').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                commentsController.create
            )
      

        return this.app;
    }

}