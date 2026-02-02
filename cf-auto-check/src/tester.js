const https = require('https');
const http = require('http');
const { URL } = require('url');

class Tester {
  constructor(config) {
    this.timeout = config.timeout || 5000;
    this.testUrl = config.testUrl || 'https://www.cloudflare.com/cdn-cgi/trace';
    this.speedTestSize = config.speedTestSize || 1048576; // 1MB
    this.speedTestDuration = config.speedTestDuration || 10000; // 10s
  }

  async testLatency(address, port = 443) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: address,
        port: port,
        path: '/cdn-cgi/trace',
        method: 'GET',
        timeout: this.timeout,
        rejectUnauthorized: false
      };
      
      const protocol = port === 443 ? https : http;
      
      const req = protocol.request(options, (res) => {
        const latency = Date.now() - startTime;
        res.resume(); // Consume response
        resolve(latency);
      });
      
      req.on('error', () => {
        resolve(-1);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(-1);
      });
      
      req.end();
    });
  }

  async testSpeed(address, port = 443) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let bytesReceived = 0;
      
      const options = {
        hostname: address,
        port: port,
        path: '/cdn-cgi/trace',
        method: 'GET',
        timeout: this.speedTestDuration,
        rejectUnauthorized: false
      };
      
      const protocol = port === 443 ? https : http;
      
      const req = protocol.request(options, (res) => {
        res.on('data', (chunk) => {
          bytesReceived += chunk.length;
        });
        
        res.on('end', () => {
          const duration = (Date.now() - startTime) / 1000; // seconds
          const speed = bytesReceived / duration; // bytes per second
          resolve(Math.round(speed));
        });
      });
      
      req.on('error', () => {
        resolve(0);
      });
      
      req.on('timeout', () => {
        req.destroy();
        const duration = (Date.now() - startTime) / 1000;
        const speed = bytesReceived / duration;
        resolve(Math.round(speed));
      });
      
      req.end();
    });
  }

  async testProxyLatency(proxyAddress) {
    // Simple TCP connection test for proxy addresses
    // For HTTP/HTTPS proxies, we can do a simple request
    if (proxyAddress.startsWith('http://') || proxyAddress.startsWith('https://')) {
      return this.testHttpProxy(proxyAddress);
    }
    
    // For SOCKS5, we'd need a SOCKS5 client library
    // For now, return -1 (not implemented)
    return -1;
  }

  async testHttpProxy(proxyUrl) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = new URL(proxyUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: '/',
        method: 'HEAD',
        timeout: this.timeout,
        rejectUnauthorized: false
      };
      
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        const latency = Date.now() - startTime;
        res.resume();
        resolve(latency);
      });
      
      req.on('error', () => {
        resolve(-1);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(-1);
      });
      
      req.end();
    });
  }

  async testDomain(domain, port = 443) {
    return this.testLatency(domain, port);
  }
}

module.exports = Tester;
