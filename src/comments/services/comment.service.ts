import { CRUD } from "../../common/crud.interface";

export interface CommentService extends CRUD {
    listAllTicketsComments:(id: string) => Promise<any>;
}