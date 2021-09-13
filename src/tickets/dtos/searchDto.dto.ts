import { CreateTicketDto } from './create.ticket.dto';

export interface SearchTicketDto extends Partial<CreateTicketDto> {
    startDate: Date,
    endDate: Date
}