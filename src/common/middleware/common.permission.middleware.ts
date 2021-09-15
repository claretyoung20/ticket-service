import express from 'express';
import { UserRole } from './common.permissionflag.enum';
import debug from 'debug';

const log: debug.IDebugger = debug('app:common-permission-middleware');

class CommonPermissionMiddleware {
    permissionFlagRequired(requiredPermissionFlag: Array<UserRole>) {
        return (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const userPermissionFlags = parseInt(res.locals.jwt.role);
                
                let isPermitted = false;
                for (let index = 0; index < requiredPermissionFlag.length; index++) {
                    
                    const element = requiredPermissionFlag[index];

                    if (userPermissionFlags & element) {
                        isPermitted = true;
                        break;
                    } else {
                        isPermitted = false; 
                    }
                }

                if(isPermitted) {
                    next();
                } else {
                    res.status(403).send({ message: 'Failed', errors: ["Unauthorized request"] });
                }
               
                
            } catch (e) {
                log(e);
            }
        };
    }

    async onlySameUserOrAdminCanDoThisAction(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const userPermissionFlags = parseInt(res.locals.jwt.role);
        if (
            req.params &&
            req.params.userId &&
            req.params.userId === res.locals.jwt.userId
        ) {
            return next();
        } else {
            if (userPermissionFlags & UserRole.ADMIN) {
                return next();
            } else {
                return res.status(403).send();
            }
        }
    }
}

export default new CommonPermissionMiddleware();
