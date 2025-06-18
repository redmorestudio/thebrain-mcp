#!/usr/bin/env node

import { spawn } from 'child_process';
import { TheBrainAPI } from './src/api-client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.THEBRAIN_API_KEY;
const DEFAULT_BRAIN_ID = process.env.THEBRAIN_DEFAULT_BRAIN_ID;

// Test configuration
const TEST_TIMEOUT = 10000; // 10 seconds per test
let testThoughtId = null;
let testLinkId = null;
let testAttachmentId = null;
let testBrainId = DEFAULT_BRAIN_ID;

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// MCP Communication
async function callMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Tool ${toolName} timed out after ${TEST_TIMEOUT}ms`));
    }, TEST_TIMEOUT);

    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      },
      id: Date.now()
    };

    // Start the MCP server
    const mcp = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let responseData = '';
    let errorData = '';

    mcp.stdout.on('data', (data) => {
      responseData += data.toString();
      
      // Try to parse complete JSON responses
      const lines = responseData.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              mcp.kill();
              
              if (response.error) {
                reject(new Error(`MCP Error: ${response.error.message}`));
              } else {
                resolve(response.result);
              }
            }
          } catch (e) {
            // Not a complete JSON line yet
          }
        }
      }
    });

    mcp.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    mcp.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    mcp.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        reject(new Error(`MCP server exited with code ${code}: ${errorData}`));
      }
    });

    // Send the request
    mcp.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Direct API tests for comparison
async function testDirectAPI() {
  log('\n=== Testing Direct API Connection ===', 'bright');
  
  try {
    const api = new TheBrainAPI(API_KEY);
    const brains = await api.listBrains();
    log(`✓ Direct API works - Found ${brains.length} brains`, 'green');
    
    if (brains.length > 0 && !testBrainId) {
      testBrainId = brains[0].id;
      log(`  Using brain: ${brains[0].name} (${testBrainId})`, 'cyan');
    }
    
    return true;
  } catch (error) {
    log(`✗ Direct API failed: ${error.message}`, 'red');
    return false;
  }
}

// Test Categories
const testCategories = [
  {
    name: 'Brain Management',
    tests: [
      {
        name: 'list_brains',
        run: async () => {
          const result = await callMCPTool('list_brains');
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_brain',
        run: async () => {
          if (!testBrainId) throw new Error('No brain ID available');
          const result = await callMCPTool('get_brain', { brainId: testBrainId });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'set_active_brain',
        run: async () => {
          if (!testBrainId) throw new Error('No brain ID available');
          const result = await callMCPTool('set_active_brain', { brainId: testBrainId });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_brain_stats',
        run: async () => {
          if (!testBrainId) throw new Error('No brain ID available');
          const result = await callMCPTool('get_brain_stats', { brainId: testBrainId });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Thought Operations',
    tests: [
      {
        name: 'create_thought',
        run: async () => {
          const result = await callMCPTool('create_thought', {
            brainId: testBrainId,
            name: `Test Thought ${Date.now()}`,
            foregroundColor: '#ffffff',
            backgroundColor: '#0066cc',
            kind: 1
          });
          if (!result.success) throw new Error(result.error);
          testThoughtId = result.thought.id;
          return result;
        }
      },
      {
        name: 'get_thought',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('get_thought', {
            brainId: testBrainId,
            thoughtId: testThoughtId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'update_thought',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('update_thought', {
            brainId: testBrainId,
            thoughtId: testThoughtId,
            name: 'Updated Test Thought',
            backgroundColor: '#ff6600'
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'search_thoughts',
        run: async () => {
          const result = await callMCPTool('search_thoughts', {
            brainId: testBrainId,
            queryText: 'test',
            maxResults: 10
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_thought_graph',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('get_thought_graph', {
            brainId: testBrainId,
            thoughtId: testThoughtId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_types',
        run: async () => {
          const result = await callMCPTool('get_types', {
            brainId: testBrainId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_tags',
        run: async () => {
          const result = await callMCPTool('get_tags', {
            brainId: testBrainId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Link Operations',
    tests: [
      {
        name: 'create_link',
        setup: async () => {
          // Create a second thought for linking
          const result = await callMCPTool('create_thought', {
            brainId: testBrainId,
            name: `Link Target ${Date.now()}`
          });
          return result.thought.id;
        },
        run: async (targetId) => {
          if (!testThoughtId || !targetId) throw new Error('Need two thoughts for linking');
          const result = await callMCPTool('create_link', {
            brainId: testBrainId,
            thoughtIdA: testThoughtId,
            thoughtIdB: targetId,
            relation: 1,
            name: 'Test Link',
            color: '#6fbf6f',
            thickness: 5
          });
          if (!result.success) throw new Error(result.error);
          testLinkId = result.link.id;
          return result;
        }
      },
      {
        name: 'get_link',
        run: async () => {
          if (!testLinkId) throw new Error('No link ID available');
          const result = await callMCPTool('get_link', {
            brainId: testBrainId,
            linkId: testLinkId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'update_link',
        run: async () => {
          if (!testLinkId) throw new Error('No link ID available');
          const result = await callMCPTool('update_link', {
            brainId: testBrainId,
            linkId: testLinkId,
            name: 'Updated Link',
            color: '#ff0000',
            thickness: 8
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Note Operations',
    tests: [
      {
        name: 'create_or_update_note',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('create_or_update_note', {
            brainId: testBrainId,
            thoughtId: testThoughtId,
            markdown: '# Test Note\n\nThis is a **test** note with *markdown*.'
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'append_to_note',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('append_to_note', {
            brainId: testBrainId,
            thoughtId: testThoughtId,
            markdown: '\n\n## Appended Section\n\nThis was appended.'
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_note',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('get_note', {
            brainId: testBrainId,
            thoughtId: testThoughtId,
            format: 'markdown'
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Attachment Operations',
    tests: [
      {
        name: 'add_url_attachment',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('add_url_attachment', {
            brainId: testBrainId,
            thoughtId: testThoughtId,
            url: 'https://example.com',
            name: 'Example Website'
          });
          if (!result.success) throw new Error(result.error);
          testAttachmentId = result.attachment.id;
          return result;
        }
      },
      {
        name: 'list_attachments',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought ID available');
          const result = await callMCPTool('list_attachments', {
            brainId: testBrainId,
            thoughtId: testThoughtId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'get_attachment',
        run: async () => {
          if (!testAttachmentId) throw new Error('No attachment ID available');
          const result = await callMCPTool('get_attachment', {
            brainId: testBrainId,
            attachmentId: testAttachmentId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Advanced Operations',
    tests: [
      {
        name: 'get_modifications',
        run: async () => {
          const result = await callMCPTool('get_modifications', {
            brainId: testBrainId,
            maxLogs: 10
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  },
  {
    name: 'Cleanup Operations',
    tests: [
      {
        name: 'delete_attachment',
        run: async () => {
          if (!testAttachmentId) throw new Error('No attachment to delete');
          const result = await callMCPTool('delete_attachment', {
            brainId: testBrainId,
            attachmentId: testAttachmentId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'delete_link',
        run: async () => {
          if (!testLinkId) throw new Error('No link to delete');
          const result = await callMCPTool('delete_link', {
            brainId: testBrainId,
            linkId: testLinkId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      },
      {
        name: 'delete_thought',
        run: async () => {
          if (!testThoughtId) throw new Error('No thought to delete');
          const result = await callMCPTool('delete_thought', {
            brainId: testBrainId,
            thoughtId: testThoughtId
          });
          if (!result.success) throw new Error(result.error);
          return result;
        }
      }
    ]
  }
];

// Run all tests
async function runAllTests() {
  log('\n🧠 TheBrain MCP Server Test Suite', 'bright');
  log('=' .repeat(50), 'blue');
  
  // Test direct API first
  const apiWorks = await testDirectAPI();
  if (!apiWorks) {
    log('\n❌ Cannot proceed without working API connection', 'red');
    return;
  }

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const category of testCategories) {
    log(`\n📁 ${category.name}`, 'yellow');
    log('-'.repeat(40), 'blue');

    for (const test of category.tests) {
      totalTests++;
      process.stdout.write(`  ${test.name}... `);
      
      try {
        let setupData = null;
        if (test.setup) {
          setupData = await test.setup();
        }
        
        const startTime = Date.now();
        const result = await test.run(setupData);
        const duration = Date.now() - startTime;
        
        log(`✓ (${duration}ms)`, 'green');
        passedTests++;
        
        if (process.env.VERBOSE) {
          console.log(`    Result:`, JSON.stringify(result, null, 2));
        }
      } catch (error) {
        log(`✗ ${error.message}`, 'red');
        failedTests++;
        
        if (process.env.VERBOSE) {
          console.error(`    Error details:`, error);
        }
      }
    }
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Summary', 'bright');
  log(`  Total: ${totalTests}`, 'cyan');
  log(`  Passed: ${passedTests}`, 'green');
  log(`  Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 
      failedTests === 0 ? 'green' : 'yellow');
  
  if (failedTests === 0) {
    log('\n✨ All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above.', 'yellow');
  }
}

// Check for required environment variables
if (!API_KEY) {
  log('❌ Error: THEBRAIN_API_KEY environment variable is required', 'red');
  log('  Please add it to your .env file', 'yellow');
  process.exit(1);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
