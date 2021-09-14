import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';
import { CreateTicketDto } from '../dtos/create.ticket.dto';
import { TicketStatus } from './ticket.status.enum copy';
import { TicketPiority } from './ticket.pirority.enum';
import { TicketDepartment } from './ticket.department.enum';
import { SearchTicketDto } from '../dtos/searchDto.dto';
import { UpdateTicketDto } from '../dtos/update.ticket.dto';
import { Schema } from 'mongoose';
const log: debug.IDebugger = debug('app:tickets-dao');

class TicketsDao {
    Schema = mongooseService.getMongoose().Schema;

    ticketSchema = new this.Schema({

        service: String,
        department: {
            type: String,
            enum: TicketDepartment,
            default: TicketDepartment.CUSTOMER_SERVICE
        },

        priority: {
            type: String,
            enum: TicketPiority,
            default: TicketPiority.MEDIUM
        },
        status: {
            type: String,
            enum: TicketStatus,
            default: TicketStatus.ACTIVE
        },

        closeByUser: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        createdByUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subject: {
            type: String,
            required: true
        },

        ticketMessage: {
            type: String,
            required: true
        },

        attachmentUrl: {
            type: [String]
        },

        dateClose: Date,

    }, { timestamps: true });

    Ticket = mongooseService.getMongoose().model('Ticket', this.ticketSchema);

    constructor() {
        log('Created new instance of TicketsDao');
    }

    async addTicket(ticketFields: CreateTicketDto) {
        const ticket = new this.Ticket({
            ...ticketFields
        });
        await ticket.save();
        return ticket._id;
    }

    async getAllTickets(limit = 25, page = 0) {
        return this.Ticket.find()
            .limit(limit)
            .skip(limit * page)
            .exec();
    }

    async getAllClosedTicketInOneMonth(searchDto: SearchTicketDto) {
        return this.Ticket.find(
            {
                dateClose: {
                    $gte: searchDto.startDate,
                    $lt: searchDto.endDate
                },
                status: TicketStatus.CLOSE
            }
        ).sort({ dateClose: 'asc' })
            .exec();
    }

    async getTicketById(ticketId: string) {
        return this.Ticket.findOne({ _id: ticketId }).exec();
    }

    async getUserTickers(searchDto: SearchTicketDto) {
        return null; // TODO
    }

    async closeTicketById(
        ticketId: string,
        ticketFields: UpdateTicketDto
    ) {
        const existingTicket = await this.Ticket.findOneAndUpdate(
            { _id: ticketId },
            {
                $set: {
                    status: TicketStatus.CLOSE,
                    closeByUser: ticketFields.closeByUser,
                    dateClose: new Date(),
                    getTimeupdatedAt: new Date()
                }
            },
            { new: true }
        ).exec();

        return existingTicket;
    }

    async reOpenTicketById(
        ticketId: string,
    ) {
        const existingTicket = await this.Ticket.findOneAndUpdate(
            { _id: ticketId },
            {
                $set: {
                    status: TicketStatus.ACTIVE,
                    updatedAt: new Date()
                }
            },
            { new: true }
        ).exec();

        return existingTicket;
    }


}

export default new TicketsDao();
