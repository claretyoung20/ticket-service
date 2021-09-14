import ticketsService from '../services/tickets.serviceImpl';
import express from 'express';
import { debug } from 'debug';
import { CreateTicketDto } from '../dtos/create.ticket.dto';
import { UpdateTicketDto } from '../dtos/update.ticket.dto';
import DownloaderService from '../../common/services/downloader.service';
import commentsService from '../../comments/services/comments.serviceImpl';

const log: debug.IDebugger = debug('app:tickets-controller');

class TicketssController {

    async listTickets(req: express.Request, res: express.Response) {
        const tickets = await ticketsService.list(100, 0);
        res.status(200).send(tickets);
    }

    async listAllClosedTicketInOneMonth(req: express.Request, res: express.Response) {
       try {
        const tickets = await ticketsService.listAllClosedTicketInOneMonth();

        const fields = [
            {
                label: 'Service',
                value: 'service'
            },
            {
                label: 'Department',
                value: 'department'
            },
            {
                label: 'Priority',
                value: 'priority'
            },
            {
                label: 'Status',
                value: 'status'
            },

            {
                label: 'Subject',
                value: 'subject'
            },

            {
                label: 'Ticket Message',
                value: 'ticketMessage'
            },

            {
                label: 'Attachment Url',
                value: 'attachmentUrl'
            },
        ];
          DownloaderService.downloadResource(res, 'tickets.csv', fields, tickets);
       } catch (error) {
           log("download error: %0", error)
           res.status(400).send({message: 'Failed', error: 'Failed to extract data.'});
       }
    }

    async getTicketById(req: express.Request, res: express.Response) {
        const ticket = await ticketsService.readById(req.body.id);
        res.status(200).send(ticket);
    }

    async createTicket(req: express.Request, res: express.Response) {
        let createTicketDto: CreateTicketDto = req.body;
        createTicketDto.createdByUser = res.locals.jwt.userId;
        const ticketId = await ticketsService.create(createTicketDto);
        res.status(201).send({ id: ticketId });
    }

    async closeTicket(req: express.Request, res: express.Response) {
        let updateTicketDto: UpdateTicketDto = req.body;
        updateTicketDto.closeByUser = res.locals.jwt.userId;
        const existingTicket = await ticketsService.patchById(req.body.id, updateTicketDto);
        res.status(201).send({ ticket: existingTicket, message: 'Successful' });
    }

    async reOpenTicket(req: express.Request, res: express.Response) {
        const ticketId = await ticketsService.reOpenTicket(req.body.id);
        res.status(201).send({ ticketId: ticketId, message: 'Successful' });
    }

    async listAllComments(req: express.Request, res: express.Response) {
        const ticket = await commentsService.listAllTicketsComments(req.body.id);
        res.status(200).send(ticket);
    }

}

export default new TicketssController();
