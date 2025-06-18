# TheBrain MCP Server

An MCP (Model Context Protocol) server that enables AI assistants to interact with TheBrain's knowledge management system. This server provides comprehensive access to TheBrain's API with a focus on rich graphical features and visual organization.

## 🆕 Recent Updates

### v1.1.0 - JSON Patch Fix (June 2025)
- ✅ **Fixed update operations**: Resolved "patchDocument field required" errors
- ✅ **Full-featured create operations**: `create_thought` and `create_link` now work with all visual properties
- ✅ **Complete visual customization**: Colors, thickness, and styling now work seamlessly
- 🧪 **Comprehensive testing**: All functions verified working with visual properties

## Features

### 🎨 Rich Visual Formatting
- **Thought Colors**: Set foreground and background colors for thoughts
- **Link Styling**: Customize link colors, thickness, and directional properties
- **Visual Organization**: Support for different thought kinds (Normal, Type, Event, Tag)

### 📎 Attachment Management
- Upload images and files to thoughts
- Add URL attachments with automatic title extraction
- Download attachment content
- Support for various file types (images, PDFs, documents)

### 🔗 Advanced Link Properties
- Customizable link relationships (Child, Parent, Jump, Sibling)
- Directional controls (one-way, bidirectional)
- Link thickness for visual emphasis
- Named links with labels

### 📝 Rich Note Support
- Full Markdown formatting
- HTML export capability
- Append functionality for incremental updates
- Embedded image support

### 🔍 Powerful Search
- Search across thoughts, notes, and attachments
- Filter by thought names only
- Configurable result limits

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/thebrain-mcp.git
cd thebrain-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API key:
```bash
THEBRAIN_API_KEY=your_api_key_here
THEBRAIN_DEFAULT_BRAIN_ID=optional_default_brain_id
```

## Configuration

### For Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "thebrain": {
      "command": "node",
      "args": ["/absolute/path/to/thebrain-mcp/index.js"],
      "env": {
        "THEBRAIN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Brain Management
- `list_brains` - List all available brains
- `get_brain` - Get brain details
- `set_active_brain` - Set the active brain for operations
- `get_brain_stats` - Get comprehensive brain statistics

### Thought Operations
- `create_thought` - Create thoughts with visual properties
- `get_thought` - Retrieve thought details
- `update_thought` - Update thought properties including colors
- `delete_thought` - Delete a thought
- `search_thoughts` - Search across the brain
- `get_thought_graph` - Get thought with all connections
- `get_types` - List all thought types
- `get_tags` - List all tags

### Link Operations
- `create_link` - Create styled links between thoughts
- `update_link` - Modify link properties
- `get_link` - Get link details
- `delete_link` - Remove a link

### Attachment Operations
- `add_file_attachment` - Attach files/images to thoughts
- `add_url_attachment` - Attach web URLs
- `get_attachment` - Get attachment metadata
- `get_attachment_content` - Download attachment content
- `delete_attachment` - Remove attachments
- `list_attachments` - List thought attachments

### Note Operations
- `get_note` - Retrieve notes in markdown/html/text
- `create_or_update_note` - Create or update notes
- `append_to_note` - Append content to existing notes

### Advanced Features
- `get_modifications` - View brain modification history

## Usage Examples

### Creating a Visual Mind Map

```javascript
// Create a central concept with color
await create_thought({
  name: "Project Alpha",
  foregroundColor: "#ffffff",
  backgroundColor: "#0066cc",
  kind: 2  // Type
});

// Add sub-concepts with visual hierarchy
await create_thought({
  name: "Phase 1: Research",
  foregroundColor: "#000000",
  backgroundColor: "#66ccff",
  sourceThoughtId: parentId,
  relation: 1  // Child
});

// Create a prominent link
await create_link({
  thoughtIdA: parentId,
  thoughtIdB: childId,
  relation: 1,
  name: "First Phase",
  color: "#ff6600",
  thickness: 8,
  direction: 1  // A→B
});
```

### Adding Visual Content

```javascript
// Attach an image
await add_file_attachment({
  thoughtId: "abc123",
  filePath: "/path/to/diagram.png",
  fileName: "Architecture Diagram.png"
});

// Create a rich note
await create_or_update_note({
  thoughtId: "abc123",
  markdown: `# Project Overview
  
## Visual Architecture
![Architecture](diagram.png)

### Key Components
- **Frontend**: React application
- **Backend**: Node.js API
- **Database**: PostgreSQL

Status: 🟢 Active`
});
```

## Visual Property Reference

### Thought Colors
- Use hex format: `#RRGGBB`
- Examples: `#ff0000` (red), `#00ff00` (green), `#0000ff` (blue)

### Link Thickness
- 1-3: Thin (subtle connections)
- 4-6: Medium (standard)
- 7-10: Thick (important connections)

### Link Direction Values
- 0: Undirected
- 1: A→B
- 3: B→A
- 5: One-way A→B
- 7: One-way B→A

### Thought Kinds
- 1: Normal (standard thoughts)
- 2: Type (categorization)
- 3: Event (time-based)
- 4: Tag (labels)
- 5: System (internal)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.

## Support

For TheBrain API documentation, visit: https://api.bra.in