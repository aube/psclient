import winston from 'winston';

// Уровень логирования из переменной окружения или по умолчанию
const logLevel = process.env.LOG_LEVEL || 'info';

// Проверяем, является ли режим разработки активным для отладочного формата
const isDevelopment = process.env.NODE_ENV !== 'production';

// Формат логов в зависимости от среды
const logFormat = isDevelopment
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports: [
    // Вывод в консоль
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, stack }) => {
              if (stack) {
                return `${timestamp} ${level}: ${message}\n${stack}`;
              }
              return `${timestamp} ${level}: ${message}`;
            })
          )
        : winston.format.combine(
            winston.format.printf(({ level, message, timestamp }) => {
              return JSON.stringify({ timestamp, level, message });
            })
          )
    }),
    // Вывод в файл
    // new winston.transports.File({ 
    //   filename: 'logs/error.log', 
    //   level: 'error',
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5
    // }),
    // new winston.transports.File({ 
    //   filename: 'logs/combined.log',
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5
    // })
  ]
});

export default logger;