import { Application } from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import express from 'express';
import CommentsController from "./controllers/comments.controller";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import commentsMiddleware from "./middleware/comments.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import { UserRole } from "../common/middleware/common.permissionflag.enum";
import ticketsMiddleware from "../tickets/middleware/tickets.middleware";

export class CommentsRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, 'CommentsRoutes');
    }

    configureRoutes(): Application {
        this.app
            .route(`/comments`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired([UserRole.ADMIN]),
                CommentsController.listComments
            )


        return this.app;
    }

}