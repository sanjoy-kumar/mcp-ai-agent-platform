import * as calculate from './calculate.js';
import * as health from './health.js';
import * as db from './db.js';

export const toolDefinitions = [
    calculate.definition,
    health.definition,
    db.definition,
];

export const toolHandlers = {
    calculate: calculate.handler,
    health_check: health.handler,
    query_db: db.handler,
};

