import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';
import { CreateCommentDto } from '../dtos/create.comment.dto';
import { Schema } from 'mongoose';
const log: debug.IDebugger = debug('app:comments-dao');

class CommentsDao {
    Schema = mongooseService.getMongoose().Schema;

    commentSchema = new this.Schema({

        comment: {
            type: String,
            required: true
        },
        ticket: {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
            required: true
        },
        commentBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        attachmentUrl: {
            type: [String]
        },
        
    }, { timestamps: true });

    Comment = mongooseService.getMongoose().model('Comment', this.commentSchema);

    constructor() {
        log('Created new instance of CommentsDao');
    }

    async addComment(commentFields: CreateCommentDto) {
        const comment = new this.Comment({
            ...commentFields
        });
        await comment.save();
         // TODO send user email: notify them of the reply
        return comment._id;
    }

    async getAllComments(limit = 25, page = 0) {
        return this.Comment.find()
            .limit(limit)
            .skip(limit * page)
            .sort({ createdAt: 'asc'}) 
            .exec();
    }

    async getCommentById(commentId: string) {
        return this.Comment.findOne({ _id: commentId })
        .sort({ createdAt: 'asc'}) 
        .exec();
    }

    async getAllTicketsComments(ticketId: string) {
        const existingComment = await this.Comment.find(
            { ticket: ticketId }
        )
        .populate(['commentBy', 'ticket'])
        .sort({ createdAt: 'desc'}) 
        .exec();
        return existingComment;
    }
}

export default new CommentsDao();
