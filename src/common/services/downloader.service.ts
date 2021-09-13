import { Parser } from 'json2csv';
import express from 'express';

export class DownloaderService {

    downloadResource(res: express.Response, fileName: string, fields: any, data: any) {
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(data);
        res.header('Content-Type', 'text/csv');
        res.attachment(fileName);
        return res.send(csv);
    }
}

export default new DownloaderService();