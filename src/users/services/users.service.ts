import { CRUD } from "../../common/crud.interface";

export interface UsersService extends CRUD{
    patchById: (id: string, resource: any) => Promise<any>;
    putById: (id: string, resource: any) => Promise<any>;
    getUserByEmailWithPassword: (email: string) => Promise<any>
    getUserByEmail: (email: string) => Promise<any>
}