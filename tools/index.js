import * as calculate from './calculate.js';
import * as health from './health.js';
import * as db from './db.js';
import * as weather from './weather.js';
import * as stock from './stock.js';
import * as file from './file.js';
import * as sentiment from './sentiment.js';
import * as indexPdf from './index_pdf.js';

export const toolDefinitions = [
    calculate.definition,
    health.definition,
    db.definition,
    weather.definition,
    stock.definition,
    file.definition,
    sentiment.definition,
    indexPdf.definition,
];

export const toolHandlers = {
    calculate: calculate.handler,
    health_check: health.handler,
    query_db: db.handler,
    get_weather: weather.handler,
    get_stock_price: stock.handler,
    read_file: file.handler,
    analyze_sentiment: sentiment.handler,
    index_pdf: indexPdf.handler,

};

