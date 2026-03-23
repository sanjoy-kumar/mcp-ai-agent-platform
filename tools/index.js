import * as calculate from './calculate.js';

export const toolDefinitions = [
    calculate.definition,
];

export const toolHandlers = {
    calculate: calculate.handler,
};

