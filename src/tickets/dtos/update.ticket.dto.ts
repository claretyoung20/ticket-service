import { TicketStatus } from "../daos/ticket.status.enum copy";

export interface UpdateTicketDto {
    status: TicketStatus,
    closeByUser: string,
} 