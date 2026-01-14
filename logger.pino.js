import pino from 'pino';

// Create a pino logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
 }
});

// Store original log methods
const originalInfo = logger.info;
const originalError = logger.error;
const originalWarn = logger.warn;
const originalDebug = logger.debug;

const logFn = fn => function (message, ...additionalParams) {
  // console.log(message, additionalParams)
  if (additionalParams.length === 0) {
    fn.call(this, message);
    return;
  }

  const logObject = { msg: message };
  
  for (let i = 0; i < additionalParams.length; i += 2) {
    const key = additionalParams[i];
    const value = additionalParams[i + 1];
    
    if (typeof key === 'string') {
      logObject[key] = value;
    } else {
      logObject[`param_${i}`] = key;
      if (value !== undefined) {
        logObject[`param_${i + 1}`] = value;
      }
    }
  }
  
  fn.call(this, logObject);
};

logger.info = logFn(originalInfo)
logger.error = logFn(originalError)
logger.warn = logFn(originalWarn)
logger.debug = logFn(originalDebug)


export default logger;