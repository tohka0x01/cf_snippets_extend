const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getLogFile() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  log(level, message, ...args) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Console output
    console.log(logMessage, ...args);
    
    // File output
    try {
      const logFile = this.getLogFile();
      const fullMessage = args.length > 0 
        ? `${logMessage} ${JSON.stringify(args)}\n`
        : `${logMessage}\n`;
      fs.appendFileSync(logFile, fullMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, ...args) {
    this.log('INFO', message, ...args);
  }

  warn(message, ...args) {
    this.log('WARN', message, ...args);
  }

  error(message, ...args) {
    this.log('ERROR', message, ...args);
  }

  debug(message, ...args) {
    this.log('DEBUG', message, ...args);
  }
}

module.exports = Logger;
