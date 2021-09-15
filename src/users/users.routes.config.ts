import { CommonRoutesConfig } from '../common/common.routes.config';
import UsersController from './controllers/users.controller';
import UsersMiddleware from './middleware/users.middleware';
import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';
import { UserRole } from '../common/middleware/common.permissionflag.enum';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import { body } from 'express-validator';

import express from 'express';

export class UsersRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'UsersRoutes');
    }

    configureRoutes(): express.Application {
        this.app
            .route(`/users`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    [UserRole.ADMIN]
                ),
                UsersController.listUsers
            )
            .post(
                body('email').isEmail(),
                body('password')
                    .isLength({ min: 5 })
                    .withMessage('Must include password (5+ characters)'),
                body('firstName').isString(),
                body('lastName').isString(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            );

        this.app.param(`userId`, UsersMiddleware.extractUserId);
        this.app
            .route(`/users/:userId`)
            .all(
                UsersMiddleware.validateUserExists,
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(UsersController.getUserById)

        this.app.put(`/users/:userId`, [
            body('phoneNumber').isString(),
            body('imageUrl').isURL(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validateSameUserIdBelongToSameLogedInUser,
            UsersMiddleware.userCantChangePermission,
            UsersController.put,
        ]);

        this.app.put(`/users/:userId/role/:role`, [
            jwtMiddleware.validJWTNeeded,
            UsersMiddleware.validateUserExists,
            permissionMiddleware.permissionFlagRequired([UserRole.ADMIN]),
            UsersController.updatePermissionFlags,
        ]);
      

        return this.app;
    }
}
