import * as calculate from './calculate.js';
import * as health from './health.js';

export const toolDefinitions = [
    calculate.definition,
    health.definition,
];

export const toolHandlers = {
    calculate: calculate.handler,
    health_check: health.handler,
};

