import http from 'http';
import path from 'path';

const port = 3001;

const reqData = (req) => {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => data+=chunk);
        req.on('end', () => resolve(data ? JSON.parse(data) : {}));
    });
};

const send = (res, status, data) => {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });

    res.end(JSON.stringify(data));
};

const sessions = [];//arr of session objects;
/**
 * {
 * id: Date.now()
 * label: labelValue,
 * duration: duration,
 * time: new Date().toIsoString(),
 * }
 */

const server = http.createServer(async (req,res) => {
    const url = new URL(req.url, 'http://localhost:3001');
    const path = url.pathname;
    const method = req.method;

    if(method === 'OPTIONS') {
        send(res, 204, {});
        return;
    }

    try{
        if(method === 'GET' && path === '/sessions'){
            //get all the stored sessions from the array of objects
            send(res,200,[...sessions].reverse());
            return;
        }

        if(method === 'POST' && path === '/session'){
            // add the session to the completed session array
            const reqBody = await reqData(req);
            sessions.push({
                id: Date.now(),
                label: reqBody.label,
                durationMin: reqBody.durationMin,
                durationSec: reqBody.durationSec,
                completedAt: new Date().toISOString(),
            });
            send(res,201,{});
            return;
        }
    } catch(err) {
        console.error(err);
        send(res,500,{error: "Server Error!"});
        return;
    }
});

server.listen(port);     