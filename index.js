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

    switch (name) {
      // Brain Management
      case 'list_brains':
        return await handlers.listBrains(api);
      
      case 'get_brain':
        return await handlers.getBrain(api, args);
      
      case 'set_active_brain':
        const result = await handlers.setActiveBrain(api, args);
        if (result.success) {
          activeBrainId = args.brainId;
        }
        return result;

      // Thought Operations
      case 'create_thought':
        return await handlers.createThought(api, args);
      
      case 'get_thought':
        return await handlers.getThought(api, args);
      
      case 'update_thought':
        return await handlers.updateThought(api, args);
      
      case 'delete_thought':
        return await handlers.deleteThought(api, args);
      
      case 'search_thoughts':
        return await handlers.searchThoughts(api, args);
      
      case 'get_thought_graph':
        return await handlers.getThoughtGraph(api, args);
        
      // Link Operations with Graphical Properties
      case 'create_link':
        return await handlers.createLink(api, args);
      
      case 'update_link':
        return await handlers.updateLink(api, args);
      
      case 'get_link':
        return await handlers.getLink(api, args);
      
      case 'delete_link':
        return await handlers.deleteLink(api, args);
        
      // Attachment Operations (Images/Files)
      case 'add_file_attachment':
        return await handlers.addFileAttachment(api, args);
      
      case 'add_url_attachment':
        return await handlers.addUrlAttachment(api, args);
      
      case 'get_attachment':
        return await handlers.getAttachment(api, args);
      
      case 'get_attachment_content':
        return await handlers.getAttachmentContent(api, args);
      
      case 'delete_attachment':
        return await handlers.deleteAttachment(api, args);
      
      case 'list_attachments':
        return await handlers.listAttachments(api, args);
        
      // Note Operations
      case 'get_note':
        return await handlers.getNote(api, args);
      
      case 'create_or_update_note':
        return await handlers.createOrUpdateNote(api, args);
      
      case 'append_to_note':
        return await handlers.appendToNote(api, args);
        
      // Advanced Operations
      case 'get_types':
        return await handlers.getTypes(api, args);
      
      case 'get_tags':
        return await handlers.getTags(api, args);
      
      case 'get_brain_stats':
        return await handlers.getBrainStats(api, args);
      
      case 'get_modifications':
        return await handlers.getModifications(api, args);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    console.error(`Error executing tool ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
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