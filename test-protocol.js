#!/usr/bin/env node

import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test MCP server communication
async function testMCP() {
  const mcp = spawn('node', ['index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  // Collect all output
  let allOutput = '';
  
  mcp.stdout.on('data', (data) => {
    const text = data.toString();
    allOutput += text;
    
    // Parse each line as potential JSON-RPC message
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        console.log('Received:', JSON.stringify(msg, null, 2));
        
        // If we get the initialization response, send initialized notification then tool call
        if (msg.id === 0 && msg.result) {
          // Send initialized notification
          const initialized = {
            jsonrpc: '2.0',
            method: 'notifications/initialized'
          };
          console.log('\nSending initialized notification');
          mcp.stdin.write(JSON.stringify(initialized) + '\n');
          
          // Then send
          const toolCall = {
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
              name: 'list_brains',
              arguments: {}
            },
            id: 1
          };
          console.log('\nSending tool call:', JSON.stringify(toolCall));
          mcp.stdin.write(JSON.stringify(toolCall) + '\n');
        }
        
        // If we get a response to our tool call
        if (msg.id === 1) {
          console.log('\nTool response received!');
          setTimeout(() => {
            mcp.kill();
            process.exit(0);
          }, 100);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  });

  mcp.stderr.on('data', (data) => {
    console.error('STDERR:', data.toString());
  });

  mcp.on('error', (error) => {
    console.error('Error:', error);
  });

  // Send initialization
  const init = {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    },
    id: 0
  };
  
  console.log('Sending initialization:', JSON.stringify(init));
  mcp.stdin.write(JSON.stringify(init) + '\n');
  
  // Timeout
  setTimeout(() => {
    console.log('\nTimeout reached. All output:', allOutput);
    mcp.kill();
    process.exit(1);
  }, 3000);
}

testMCP();
