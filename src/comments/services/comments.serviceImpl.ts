import { debug } from "debug";
import CommentsDao from "../daos/comments.dao";
import { CreateCommentDto } from "../dtos/create.comment.dto";
import { CommentService } from "./comment.service";

const log: debug.IDebugger = debug('app:comments-controller');

class CommentServiceImp implements CommentService  {

    async create(resource: CreateCommentDto) {
        log("Create new Comment: %0",resource);
        return CommentsDao.addComment(resource);
    }

    async list(limit: number, page: number) {
        return CommentsDao.getAllComments(limit, page);
    }

    async readById(commentId: string) {
        return CommentsDao.getCommentById(commentId);
    }

    async listAllTicketsComments(ticketId: string) {
        return CommentsDao.getAllTicketsComments(ticketId);
    }
    
}
export default new CommentServiceImp();