const axios = require('axios');

class ApiClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async getCFIPs() {
    try {
      const response = await this.client.get('/api/cfip');
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get CF IPs: ${error.message}`);
    }
  }

  async updateCFIP(id, data) {
    try {
      const response = await this.client.put(`/api/cfip/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update CF IP ${id}: ${error.message}`);
    }
  }

  async getProxyIPs() {
    try {
      const response = await this.client.get('/api/proxyip');
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get Proxy IPs: ${error.message}`);
    }
  }

  async updateProxyIP(id, data) {
    try {
      const response = await this.client.put(`/api/proxyip/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update Proxy IP ${id}: ${error.message}`);
    }
  }

  async getOutbounds() {
    try {
      const response = await this.client.get('/api/outbound');
      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to get Outbounds: ${error.message}`);
    }
  }

  async updateOutbound(id, data) {
    try {
      const response = await this.client.put(`/api/outbound/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update Outbound ${id}: ${error.message}`);
    }
  }

  async testOutbound(id) {
    try {
      const response = await this.client.post('/api/test-outbound', { id });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to test Outbound ${id}: ${error.message}`);
    }
  }

  async checkExit(id) {
    try {
      const response = await this.client.post('/api/check-exit', { id });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to check exit ${id}: ${error.message}`);
    }
  }
}

module.exports = ApiClient;
