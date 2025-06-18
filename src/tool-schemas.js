// src/tool-schemas.js

export const toolSchemas = {
  // Brain Management
  list_brains: {
    name: 'list_brains',
    description: 'List all available brains for the user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  get_brain: {
    name: 'get_brain',
    description: 'Get details about a specific brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
      },
      required: ['brainId'],
    },
  },

  set_active_brain: {
    name: 'set_active_brain',
    description: 'Set the active brain for subsequent operations',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain to set as active',
        },
      },
      required: ['brainId'],
    },
  },

  // Thought Operations with Visual Properties
  create_thought: {
    name: 'create_thought',
    description: 'Create a new thought with optional visual properties',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain (uses active brain if not specified)',
        },
        name: {
          type: 'string',
          description: 'The name of the thought',
        },
        kind: {
          type: 'number',
          description: 'Kind of thought: 1=Normal, 2=Type, 3=Event, 4=Tag, 5=System',
          enum: [1, 2, 3, 4, 5],
        },
        label: {
          type: 'string',
          description: 'Optional label for the thought',
        },
        foregroundColor: {
          type: 'string',
          description: 'Foreground color in hex format (e.g., "#ff0000")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        backgroundColor: {
          type: 'string',
          description: 'Background color in hex format (e.g., "#0000ff")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        typeId: {
          type: 'string',
          description: 'ID of the thought type to assign',
        },
        sourceThoughtId: {
          type: 'string',
          description: 'ID of the source thought to link from',
        },
        relation: {
          type: 'number',
          description: 'Relation type if linking: 1=Child, 2=Parent, 3=Jump, 4=Sibling',
          enum: [1, 2, 3, 4],
        },
        acType: {
          type: 'number',
          description: 'Access type: 0=Public, 1=Private',
          enum: [0, 1],
        },
      },
      required: ['name'],
    },
  },

  update_thought: {
    name: 'update_thought',
    description: 'Update a thought including its visual properties',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought to update',
        },
        name: {
          type: 'string',
          description: 'New name for the thought',
        },
        label: {
          type: 'string',
          description: 'New label for the thought',
        },
        foregroundColor: {
          type: 'string',
          description: 'New foreground color in hex format (e.g., "#ff0000")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        backgroundColor: {
          type: 'string',
          description: 'New background color in hex format (e.g., "#0000ff")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        kind: {
          type: 'number',
          description: 'New kind: 1=Normal, 2=Type, 3=Event, 4=Tag, 5=System',
          enum: [1, 2, 3, 4, 5],
        },
        acType: {
          type: 'number',
          description: 'New access type: 0=Public, 1=Private',
          enum: [0, 1],
        },
        typeId: {
          type: 'string',
          description: 'New type ID to assign',
        },
      },
      required: ['thoughtId'],
    },
  },

  // Link Operations with Rich Graphical Properties
  create_link: {
    name: 'create_link',
    description: 'Create a link between two thoughts with visual properties',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtIdA: {
          type: 'string',
          description: 'ID of the first thought',
        },
        thoughtIdB: {
          type: 'string',
          description: 'ID of the second thought',
        },
        relation: {
          type: 'number',
          description: 'Relation type: 1=Child, 2=Parent, 3=Jump, 4=Sibling',
          enum: [1, 2, 3, 4],
        },
        name: {
          type: 'string',
          description: 'Label for the link',
        },
        color: {
          type: 'string',
          description: 'Link color in hex format (e.g., "#6fbf6f")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        thickness: {
          type: 'number',
          description: 'Link thickness (visual weight)',
          minimum: 1,
          maximum: 10,
        },
        direction: {
          type: 'number',
          description: 'Direction flags: 1=IsDirected, 2=DirectionBA, 4=OneWay',
        },
        typeId: {
          type: 'string',
          description: 'ID of link type',
        },
      },
      required: ['thoughtIdA', 'thoughtIdB', 'relation'],
    },
  },

  update_link: {
    name: 'update_link',
    description: 'Update link properties including visual formatting',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        linkId: {
          type: 'string',
          description: 'The ID of the link to update',
        },
        name: {
          type: 'string',
          description: 'New label for the link',
        },
        color: {
          type: 'string',
          description: 'New link color in hex format (e.g., "#6fbf6f")',
          pattern: '^#[0-9a-fA-F]{6}$',
        },
        thickness: {
          type: 'number',
          description: 'New link thickness',
          minimum: 1,
          maximum: 10,
        },
        direction: {
          type: 'number',
          description: 'New direction flags',
        },
        relation: {
          type: 'number',
          description: 'New relation type: 1=Child, 2=Parent, 3=Jump, 4=Sibling',
          enum: [1, 2, 3, 4],
        },
      },
      required: ['linkId'],
    },
  },

  // Attachment Operations for Images and Files
  add_file_attachment: {
    name: 'add_file_attachment',
    description: 'Add a file attachment (including images) to a thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        filePath: {
          type: 'string',
          description: 'Path to the file to attach',
        },
        fileName: {
          type: 'string',
          description: 'Name for the attachment (optional, uses filename if not provided)',
        },
      },
      required: ['thoughtId', 'filePath'],
    },
  },

  add_url_attachment: {
    name: 'add_url_attachment',
    description: 'Add a URL attachment to a thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        url: {
          type: 'string',
          description: 'The URL to attach',
        },
        name: {
          type: 'string',
          description: 'Name for the URL attachment (auto-fetched from page title if not provided)',
        },
      },
      required: ['thoughtId', 'url'],
    },
  },

  get_attachment_content: {
    name: 'get_attachment_content',
    description: 'Get the binary content of an attachment (e.g., download an image)',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        attachmentId: {
          type: 'string',
          description: 'The ID of the attachment',
        },
        saveToPath: {
          type: 'string',
          description: 'Optional path to save the file locally',
        },
      },
      required: ['attachmentId'],
    },
  },

  // Note Operations with Rich Content Support
  get_note: {
    name: 'get_note',
    description: 'Get the note content for a thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        format: {
          type: 'string',
          description: 'Output format',
          enum: ['markdown', 'html', 'text'],
          default: 'markdown',
        },
      },
      required: ['thoughtId'],
    },
  },

  create_or_update_note: {
    name: 'create_or_update_note',
    description: 'Create or update a note with markdown content',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        markdown: {
          type: 'string',
          description: 'Markdown content for the note',
        },
      },
      required: ['thoughtId', 'markdown'],
    },
  },

  append_to_note: {
    name: 'append_to_note',
    description: 'Append content to an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        markdown: {
          type: 'string',
          description: 'Markdown content to append',
        },
      },
      required: ['thoughtId', 'markdown'],
    },
  },

  // Search Operations
  search_thoughts: {
    name: 'search_thoughts',
    description: 'Search for thoughts in a brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        queryText: {
          type: 'string',
          description: 'Search query text',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results',
          default: 30,
        },
        onlySearchThoughtNames: {
          type: 'boolean',
          description: 'Only search in thought names (not content)',
          default: false,
        },
      },
      required: ['queryText'],
    },
  },

  // Other Operations
  get_thought: {
    name: 'get_thought',
    description: 'Get details about a specific thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
      },
      required: ['thoughtId'],
    },
  },

  get_thought_graph: {
    name: 'get_thought_graph',
    description: 'Get a thought with all its connections and attachments',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
        includeSiblings: {
          type: 'boolean',
          description: 'Include sibling thoughts in the graph',
          default: false,
        },
      },
      required: ['thoughtId'],
    },
  },

  delete_thought: {
    name: 'delete_thought',
    description: 'Delete a thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
      },
      required: ['thoughtId'],
    },
  },

  get_link: {
    name: 'get_link',
    description: 'Get details about a specific link',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        linkId: {
          type: 'string',
          description: 'The ID of the link',
        },
      },
      required: ['linkId'],
    },
  },

  delete_link: {
    name: 'delete_link',
    description: 'Delete a link',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        linkId: {
          type: 'string',
          description: 'The ID of the link',
        },
      },
      required: ['linkId'],
    },
  },

  get_attachment: {
    name: 'get_attachment',
    description: 'Get metadata about an attachment',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        attachmentId: {
          type: 'string',
          description: 'The ID of the attachment',
        },
      },
      required: ['attachmentId'],
    },
  },

  delete_attachment: {
    name: 'delete_attachment',
    description: 'Delete an attachment',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        attachmentId: {
          type: 'string',
          description: 'The ID of the attachment',
        },
      },
      required: ['attachmentId'],
    },
  },

  list_attachments: {
    name: 'list_attachments',
    description: 'List all attachments for a thought',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        thoughtId: {
          type: 'string',
          description: 'The ID of the thought',
        },
      },
      required: ['thoughtId'],
    },
  },

  get_types: {
    name: 'get_types',
    description: 'Get all thought types in a brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
      },
      required: [],
    },
  },

  get_tags: {
    name: 'get_tags',
    description: 'Get all tags in a brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
      },
      required: [],
    },
  },

  get_brain_stats: {
    name: 'get_brain_stats',
    description: 'Get statistics about a brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
      },
      required: [],
    },
  },

  get_modifications: {
    name: 'get_modifications',
    description: 'Get modification history for a brain',
    inputSchema: {
      type: 'object',
      properties: {
        brainId: {
          type: 'string',
          description: 'The ID of the brain',
        },
        maxLogs: {
          type: 'number',
          description: 'Maximum number of logs to return',
          default: 100,
        },
        startTime: {
          type: 'string',
          description: 'Start time for logs (ISO format)',
        },
        endTime: {
          type: 'string',
          description: 'End time for logs (ISO format)',
        },
      },
      required: [],
    },
  },
};