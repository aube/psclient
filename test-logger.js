import logger from './logger.pino.js';

console.log('Testing logger with different levels...');

// Тестируем все уровни логирования
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Тестируем логирование с метаданными
logger.info('Test message with metadata', { userId: 123, action: 'login', ip: '192.168.1.1' });

logger.debug('Debug message with metadata', { requestId: 'abc123', processingTime: 150 });

// Тестируем проблему с несколькими аргументами
logger.info("PORT", { portValue: process.env.PORT || 900 });
logger.info("test", 111, { path: 'isProduction' });

// Альтернативный способ логирования нескольких значений
logger.info(`PORT value is: ${process.env.PORT || 9000}`);
logger.info(`Multiple values: test, ${111}, path: isProduction`);

console.log('Logger test completed. Check the logs/ directory for log files.');