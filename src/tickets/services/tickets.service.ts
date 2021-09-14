import { CRUD } from "../../common/crud.interface";

export interface TicketService extends CRUD{
    patchById: (id: string, resource: any) => Promise<any>;
    putById: (id: string, resource: any) => Promise<any>;
    listAllClosedTicketInOneMonth: () => Promise<any>;
    reOpenTicket: (id: string) => Promise<any>;
}