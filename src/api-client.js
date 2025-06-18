// src/api-client.js
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';

export class TheBrainAPI {
  constructor(apiKey, baseUrl = 'https://api.bra.in') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  async request(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Properly merge headers to avoid overwriting Authorization
    const fetchOptions = {
      method,
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,  // Merge custom headers AFTER default headers
      },
    };

    // Add Content-Type for JSON payloads
    if (options.body && !(options.body instanceof FormData)) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore parse errors
        }
        throw new Error(errorMessage);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (method === 'DELETE' || response.status === 204) {
        return { success: true };
      } else if (endpoint.includes('/file-content')) {
        // Return buffer for file content
        return await response.buffer();
      } else {
        // Return text for other responses
        return await response.text();
      }
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // Brain Management
  async listBrains() {
    return this.request('GET', '/brains');
  }

  async getBrain(brainId) {
    return this.request('GET', `/brains/${brainId}`);
  }

  async getBrainStats(brainId) {
    return this.request('GET', `/brains/${brainId}/statistics`);
  }

  async getBrainModifications(brainId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.maxLogs) queryParams.append('maxLogs', params.maxLogs);
    if (params.startTime) queryParams.append('startTime', params.startTime);
    if (params.endTime) queryParams.append('endTime', params.endTime);
    
    const query = queryParams.toString();
    return this.request('GET', `/brains/${brainId}/modifications${query ? '?' + query : ''}`);
  }

  // Thought Operations
  async createThought(brainId, thoughtData) {
    return this.request('POST', `/thoughts/${brainId}`, {
      body: thoughtData,
    });
  }

  async getThought(brainId, thoughtId) {
    return this.request('GET', `/thoughts/${brainId}/${thoughtId}`);
  }

  async updateThought(brainId, thoughtId, updates) {
    // TheBrain API uses JSON Patch for updates
    const patches = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patches.push({
          op: 'replace',
          path: `/${key}`,
          value: value,
        });
      }
    }

    return this.request('PATCH', `/thoughts/${brainId}/${thoughtId}`, {
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      body: patches,
    });
  }

  async deleteThought(brainId, thoughtId) {
    return this.request('DELETE', `/thoughts/${brainId}/${thoughtId}`);
  }

  async getThoughtGraph(brainId, thoughtId, includeSiblings = false) {
    const params = new URLSearchParams({ includeSiblings });
    return this.request('GET', `/thoughts/${brainId}/${thoughtId}/graph?${params}`);
  }

  async searchThoughts(brainId, queryText, maxResults = 30, onlySearchThoughtNames = false) {
    const params = new URLSearchParams({
      queryText,
      maxResults,
      onlySearchThoughtNames,
    });
    return this.request('GET', `/search/${brainId}?${params}`);
  }

  async getTypes(brainId) {
    return this.request('GET', `/thoughts/${brainId}/types`);
  }

  async getTags(brainId) {
    return this.request('GET', `/thoughts/${brainId}/tags`);
  }

  // Link Operations with Graphical Properties
  async createLink(brainId, linkData) {
    return this.request('POST', `/links/${brainId}`, {
      body: linkData,
    });
  }

  async getLink(brainId, linkId) {
    return this.request('GET', `/links/${brainId}/${linkId}`);
  }

  async updateLink(brainId, linkId, updates) {
    // JSON Patch for link updates
    const patches = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patches.push({
          op: 'replace',
          path: `/${key}`,
          value: value,
        });
      }
    }

    return this.request('PATCH', `/links/${brainId}/${linkId}`, {
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      body: patches,
    });
  }

  async deleteLink(brainId, linkId) {
    return this.request('DELETE', `/links/${brainId}/${linkId}`);
  }

  // Attachment Operations (Images/Files)
  async addFileAttachment(brainId, thoughtId, filePath, fileName) {
    const form = new FormData();
    
    // Get file stats to determine size
    const stats = await fs.stat(filePath);
    const fileStream = createReadStream(filePath);
    
    form.append('file', fileStream, {
      filename: fileName || path.basename(filePath),
      contentType: this.getMimeType(filePath),
      knownLength: stats.size,
    });

    return this.request('POST', `/attachments/${brainId}/${thoughtId}/file`, {
      body: form,
      headers: form.getHeaders(),
    });
  }

  async addUrlAttachment(brainId, thoughtId, url, name) {
    const params = new URLSearchParams({ url });
    if (name) params.append('name', name);
    
    return this.request('POST', `/attachments/${brainId}/${thoughtId}/url?${params}`);
  }

  async getAttachment(brainId, attachmentId) {
    return this.request('GET', `/attachments/${brainId}/${attachmentId}/metadata`);
  }

  async getAttachmentContent(brainId, attachmentId) {
    return this.request('GET', `/attachments/${brainId}/${attachmentId}/file-content`);
  }

  async deleteAttachment(brainId, attachmentId) {
    return this.request('DELETE', `/attachments/${brainId}/${attachmentId}`);
  }

  async listAttachments(brainId, thoughtId) {
    return this.request('GET', `/thoughts/${brainId}/${thoughtId}/attachments`);
  }

  // Note Operations
  async getNote(brainId, thoughtId, format = 'markdown') {
    const endpoint = format === 'html' ? `/notes/${brainId}/${thoughtId}/html` :
                     format === 'text' ? `/notes/${brainId}/${thoughtId}/text` :
                     `/notes/${brainId}/${thoughtId}`;
    return this.request('GET', endpoint);
  }

  async createOrUpdateNote(brainId, thoughtId, markdown) {
    return this.request('POST', `/notes/${brainId}/${thoughtId}/update`, {
      body: { markdown },
    });
  }

  async appendToNote(brainId, thoughtId, markdown) {
    return this.request('POST', `/notes/${brainId}/${thoughtId}/append`, {
      body: { markdown },
    });
  }

  // Helper method for MIME types
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}