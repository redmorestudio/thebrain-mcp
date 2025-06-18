#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { TheBrainAPI } from './src/api-client.js';
import { toolSchemas } from './src/tool-schemas.js';
import * as handlers from './src/handlers/index.js';

// Load environment variables
dotenv.config();

// Validate API key
const API_KEY = process.env.THEBRAIN_API_KEY;
if (!API_KEY) {
  console.error('Error: THEBRAIN_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize API client
const api = new TheBrainAPI(API_KEY);

// Initialize MCP server
const server = new Server(
  {
    name: 'thebrain-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Brain context management
let activeBrainId = process.env.THEBRAIN_DEFAULT_BRAIN_ID || null;

// Helper function to format tool results according to MCP protocol
function formatToolResult(result) {
  // MCP expects tool results to have a content array
  // Each content item should have a type and text as a plain string
  
  let textContent;
  if (typeof result === 'string') {
    textContent = result;
  } else if (result === null || result === undefined) {
    textContent = 'null';
  } else {
    textContent = JSON.stringify(result, null, 2);
  }
  
  // Ensure textContent is always a string
  textContent = String(textContent);
  
  return {
    content: [
      {
        type: 'text',
        text: textContent  // Direct string, not nested object
      }
    ]
  };
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(toolSchemas),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Add active brain ID to args if not specified
    if (activeBrainId && !args.brainId) {
      args.brainId = activeBrainId;
    }

    let result;

    switch (name) {
      // Brain Management
      case 'list_brains':
        result = await handlers.listBrains(api);
        break;
      
      case 'get_brain':
        result = await handlers.getBrain(api, args);
        break;
      
      case 'set_active_brain':
        result = await handlers.setActiveBrain(api, args);
        if (result.success) {
          activeBrainId = args.brainId;
        }
        break;

      // Thought Operations
      case 'create_thought':
        result = await handlers.createThought(api, args);
        break;
      
      case 'get_thought':
        result = await handlers.getThought(api, args);
        break;
      
      case 'update_thought':
        result = await handlers.updateThought(api, args);
        break;
      
      case 'delete_thought':
        result = await handlers.deleteThought(api, args);
        break;
      
      case 'search_thoughts':
        result = await handlers.searchThoughts(api, args);
        break;
      
      case 'get_thought_graph':
        result = await handlers.getThoughtGraph(api, args);
        break;
        
      // Link Operations with Graphical Properties
      case 'create_link':
        result = await handlers.createLink(api, args);
        break;
      
      case 'update_link':
        result = await handlers.updateLink(api, args);
        break;
      
      case 'get_link':
        result = await handlers.getLink(api, args);
        break;
      
      case 'delete_link':
        result = await handlers.deleteLink(api, args);
        break;
        
      // Attachment Operations (Images/Files)
      case 'add_file_attachment':
        result = await handlers.addFileAttachment(api, args);
        break;
      
      case 'add_url_attachment':
        result = await handlers.addUrlAttachment(api, args);
        break;
      
      case 'get_attachment':
        result = await handlers.getAttachment(api, args);
        break;
      
      case 'get_attachment_content':
        result = await handlers.getAttachmentContent(api, args);
        break;
      
      case 'delete_attachment':
        result = await handlers.deleteAttachment(api, args);
        break;
      
      case 'list_attachments':
        result = await handlers.listAttachments(api, args);
        break;
        
      // Note Operations
      case 'get_note':
        result = await handlers.getNote(api, args);
        break;
      
      case 'create_or_update_note':
        result = await handlers.createOrUpdateNote(api, args);
        break;
      
      case 'append_to_note':
        result = await handlers.appendToNote(api, args);
        break;
        
      // Advanced Operations
      case 'get_types':
        result = await handlers.getTypes(api, args);
        break;
      
      case 'get_tags':
        result = await handlers.getTags(api, args);
        break;
      
      case 'get_brain_stats':
        result = await handlers.getBrainStats(api, args);
        break;
      
      case 'get_modifications':
        result = await handlers.getModifications(api, args);
        break;

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }

    // Format the result according to MCP protocol
    return formatToolResult(result);

  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    console.error(`Error executing tool ${name}:`, error);
    
    // Return error in MCP format
    return formatToolResult({
      success: false,
      error: error.message
    });
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TheBrain MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
