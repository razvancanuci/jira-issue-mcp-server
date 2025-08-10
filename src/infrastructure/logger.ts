import {ElasticsearchTransport, ElasticsearchTransportOptions} from "winston-elasticsearch";
import winston from "winston";

if(process.env.ENVIRONMENT !== 'local') {

}
const esTransportOpts: ElasticsearchTransportOptions = {
    level: 'info',
    clientOpts: {
        node: process.env.ELASTIC_URL,
        auth: {
            apiKey: process.env.ELASTIC_API_KEY as string
        },
    },
    indexPrefix: 'jira-tool-mcp-server-logs',
    ensureIndexTemplate: true
};

const esTransport = new ElasticsearchTransport(esTransportOpts);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        esTransport
    ],
    exitOnError: false
});


logger.on('error', (error) => {
    console.error('Error in logger caught', error);
});

esTransport.on('error', (error) => {
    console.error('Error in logger caught', error);
});

export { logger };
