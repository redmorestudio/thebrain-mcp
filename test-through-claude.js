#!/usr/bin/env node

/**
 * Simple test script to be run through Claude
 * This outputs the test commands that Claude should execute
 */

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

log('\n🧠 TheBrain MCP Server Test Instructions', 'bright');
log('=' .repeat(50), 'blue');
log('\nThese are the tools to test in order:', 'cyan');

const testSequence = [
  {
    category: 'Brain Management',
    tests: [
      { tool: 'list_brains', params: {} },
      { tool: 'get_brain', params: { brainId: 'USE_FIRST_BRAIN_ID' } },
      { tool: 'set_active_brain', params: { brainId: 'USE_FIRST_BRAIN_ID' } },
      { tool: 'get_brain_stats', params: { brainId: 'USE_ACTIVE_BRAIN' } },
    ]
  },
  {
    category: 'Thought Operations',
    tests: [
      { tool: 'create_thought', params: { 
        name: 'Test Thought ' + Date.now(),
        backgroundColor: '#0066cc',
        foregroundColor: '#ffffff',
        kind: 1
      }},
      { tool: 'get_thought', params: { thoughtId: 'USE_CREATED_THOUGHT_ID' } },
      { tool: 'update_thought', params: { 
        thoughtId: 'USE_CREATED_THOUGHT_ID',
        name: 'Updated Test Thought',
        backgroundColor: '#ff6600'
      }},
      { tool: 'search_thoughts', params: { queryText: 'test', maxResults: 10 } },
      { tool: 'get_thought_graph', params: { thoughtId: 'USE_CREATED_THOUGHT_ID' } },
      { tool: 'get_types', params: {} },
      { tool: 'get_tags', params: {} },
    ]
  },
  {
    category: 'Link Operations',
    tests: [
      { tool: 'create_thought', params: { name: 'Link Target ' + Date.now() }, note: 'Create second thought for linking' },
      { tool: 'create_link', params: { 
        thoughtIdA: 'USE_FIRST_THOUGHT_ID',
        thoughtIdB: 'USE_SECOND_THOUGHT_ID',
        relation: 1,
        name: 'Test Link',
        color: '#6fbf6f',
        thickness: 5
      }},
      { tool: 'get_link', params: { linkId: 'USE_CREATED_LINK_ID' } },
      { tool: 'update_link', params: { 
        linkId: 'USE_CREATED_LINK_ID',
        name: 'Updated Link',
        color: '#ff0000',
        thickness: 8
      }},
    ]
  },
  {
    category: 'Note Operations',
    tests: [
      { tool: 'create_or_update_note', params: { 
        thoughtId: 'USE_FIRST_THOUGHT_ID',
        markdown: '# Test Note\\n\\nThis is a **test** note with *markdown*.'
      }},
      { tool: 'append_to_note', params: { 
        thoughtId: 'USE_FIRST_THOUGHT_ID',
        markdown: '\\n\\n## Appended Section\\n\\nThis was appended.'
      }},
      { tool: 'get_note', params: { 
        thoughtId: 'USE_FIRST_THOUGHT_ID',
        format: 'markdown'
      }},
    ]
  },
  {
    category: 'Attachment Operations', 
    tests: [
      { tool: 'add_url_attachment', params: { 
        thoughtId: 'USE_FIRST_THOUGHT_ID',
        url: 'https://example.com',
        name: 'Example Website'
      }},
      { tool: 'list_attachments', params: { thoughtId: 'USE_FIRST_THOUGHT_ID' } },
      { tool: 'get_attachment', params: { attachmentId: 'USE_CREATED_ATTACHMENT_ID' } },
    ]
  },
  {
    category: 'Advanced Operations',
    tests: [
      { tool: 'get_modifications', params: { maxLogs: 10 } },
    ]
  },
  {
    category: 'Cleanup Operations',
    tests: [
      { tool: 'delete_attachment', params: { attachmentId: 'USE_CREATED_ATTACHMENT_ID' } },
      { tool: 'delete_link', params: { linkId: 'USE_CREATED_LINK_ID' } },
      { tool: 'delete_thought', params: { thoughtId: 'USE_FIRST_THOUGHT_ID' } },
      { tool: 'delete_thought', params: { thoughtId: 'USE_SECOND_THOUGHT_ID' } },
    ]
  }
];

// Print test sequence
testSequence.forEach(category => {
  log(`\n📁 ${category.category}`, 'yellow');
  category.tests.forEach((test, index) => {
    if (test.note) {
      log(`  ${index + 1}. ${test.note}`, 'cyan');
    }
    log(`  ${index + 1}. ${test.tool}`, 'green');
    console.log(`     Parameters: ${JSON.stringify(test.params, null, 2).replace(/\n/g, '\n     ')}`);
  });
});

log('\n' + '='.repeat(50), 'blue');
log('Instructions:', 'bright');
log('1. Replace placeholder IDs with actual values from previous responses', 'cyan');
log('2. Check each response for success: true', 'cyan');
log('3. Note any errors or unexpected results', 'cyan');

