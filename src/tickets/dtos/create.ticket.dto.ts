import { TicketDepartment } from "../daos/ticket.department.enum";
import { TicketPiority } from "../daos/ticket.pirority.enum";

export interface CreateTicketDto {
    department?: TicketDepartment,
    service?: string,
    priority: TicketPiority,
    createdByUser: string,
    subject:string,
    ticketMessage: string,
    attachmentUrl: []
} 