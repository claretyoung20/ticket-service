import { debug } from "debug";
import { CRUD } from "../../common/crud.interface";
import { TicketDepartment } from "../daos/ticket.department.enum";
import TicketsDao from "../daos/tickets.dao";
import { CreateTicketDto } from "../dtos/create.ticket.dto";
import { SearchTicketDto } from "../dtos/searchDto.dto";
import { UpdateTicketDto } from "../dtos/update.ticket.dto";
import { TicketService } from "./tickets.service";

const log: debug.IDebugger = debug('app:tickets-controller');

class TicketServiceImpl implements TicketService {

    async create(resource: CreateTicketDto) {
        log("Create new Ticket: %0",resource);
        return TicketsDao.addTicket(resource);
    }

    async list(limit: number, page: number) {
        return TicketsDao.getAllTickets(limit, page);
    }

     async listAllClosedTicketInOneMonth() {
         let endDate =  new Date;
        let startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        log(startDate)
        log(endDate);

         let searchDto: SearchTicketDto = {
             startDate,
             endDate
         }
        return TicketsDao.getAllClosedTicketInOneMonth(searchDto);
    }

    async patchById(id: string, resource: UpdateTicketDto) {
        return TicketsDao.closeTicketById(id, resource);
    }

    async readById(id: string) {
        return TicketsDao.getTicketById(id);
    }

    async putById(id: string, resource: UpdateTicketDto) {
        return null; // TODO
    }

    async reOpenTicket(id: string) {
        return TicketsDao.reOpenTicketById(id);
    }
}
export default new TicketServiceImpl();