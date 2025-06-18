#!/usr/bin/env node

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test a simple tool call
async function testSimpleTool() {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let responseData = '';
    let errorData = '';
    let initialized = false;

    mcp.stdout.on('data', (data) => {
      const text = data.toString();
      console.log('STDOUT:', text);
      responseData += text;
      
      // Look for initialization message
      if (!initialized && text.includes('capabilities')) {
        initialized = true;
        
        // Send list_brains request
        const request = {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'list_brains',
            arguments: {}
          },
          id: 1
        };
        
        console.log('Sending request:', JSON.stringify(request));
        mcp.stdin.write(JSON.stringify(request) + '\n');
      }
      
      // Try to parse complete JSON responses
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"id":1')) {
          try {
            const response = JSON.parse(line);
            console.log('Response:', JSON.stringify(response, null, 2));
            mcp.kill();
            resolve(response);
          } catch (e) {
            // Not a complete JSON line yet
          }
        }
      }
    });

    mcp.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error('STDERR:', data.toString());
    });

    mcp.on('error', (error) => {
      console.error('Process error:', error);
      reject(error);
    });

    mcp.on('close', (code) => {
      console.log('Process closed with code:', code);
      if (code !== 0 && code !== null) {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      mcp.kill();
      reject(new Error('Timeout'));
    }, 5000);
  });
}

// Run test
console.log('Testing MCP server format...\n');
testSimpleTool().catch(console.error);
