# TheBrain MCP Server - Technical Documentation

## Overview

This MCP server provides complete integration with TheBrain's knowledge management API, with special emphasis on rich visual features and graphical customization.

## Architecture

### Core Components

```
thebrain-mcp/
├── index.js                    # Main MCP server entry point
├── src/
│   ├── api-client.js          # TheBrain API wrapper with JSON Patch support
│   ├── tool-schemas.js        # MCP tool definitions and parameters
│   └── handlers/
│       ├── index.js           # Handler exports
│       ├── thoughts.js        # Thought operations with visual properties
│       ├── links.js           # Link operations with styling
│       ├── attachments.js     # File and image handling
│       ├── notes.js           # Rich note operations
│       └── stats.js           # Statistics and modifications
└── test-all-tools.js          # Comprehensive test suite
```

### Key Design Patterns

#### Two-Step Visual Property Application
Both `create_thought` and `create_link` use a two-step process for visual properties:

1. **Create basic object** with core properties (name, relation, etc.)
2. **Apply visual properties** via update operations (colors, thickness, etc.)

This design allows for:
- Reliable object creation even if visual properties fail
- Consistent API behavior across all visual features
- Proper error handling for each step

#### JSON Patch Format Compliance
The server properly implements TheBrain's JSON Patch requirements:

```javascript
// Correct format for updates
{
  "patchDocument": [
    { "op": "replace", "path": "/backgroundColor", "value": "#ff0000" },
    { "op": "replace", "path": "/name", "value": "New Name" }
  ]
}
```

## Visual Properties Reference

### Thought Colors
- **Format**: Hex colors `#RRGGBB`
- **Properties**: `foregroundColor`, `backgroundColor`
- **Examples**: `#ff0000` (red), `#00ff00` (green), `#0066cc` (blue)

### Link Styling
- **Color**: Hex format `#RRGGBB`
- **Thickness**: 1-10 scale (1=thin, 10=very thick)
- **Direction**: Bitfield values
  - `0`: Undirected
  - `1`: Directed A→B  
  - `3`: Directed B→A
  - `5`: One-way A→B
  - `7`: One-way B→A

### Thought Kinds
- `1`: Normal (standard thoughts)
- `2`: Type (categorization)
- `3`: Event (time-based)
- `4`: Tag (labels)
- `5`: System (internal)

## API Integration Details

### Authentication
- Uses Bearer token authentication
- API key stored in environment variables
- Automatic header injection for all requests

### Request Handling
- **JSON Payloads**: Standard application/json
- **File Uploads**: Multipart form data with streams
- **Error Handling**: HTTP status code parsing with detailed messages

### Response Processing
- **JSON Responses**: Automatic parsing
- **Binary Content**: Buffer handling for file downloads
- **Text Responses**: Plain text for simple operations

## Recent Fixes (v1.1.0)

### JSON Patch Format Issue
**Problem**: Update operations failed with "patchDocument field required" error

**Root Cause**: TheBrain API expects wrapped patch format:
```javascript
// Incorrect (was sending)
[{"op": "replace", "path": "/name", "value": "New"}]

// Correct (now sending)  
{"patchDocument": [{"op": "replace", "path": "/name", "value": "New"}]}
```

**Solution**: Modified `updateThought` and `updateLink` in `api-client.js` to wrap patch operations in `patchDocument` field.

**Impact**: Enables full-featured create operations with visual properties.

### Authorization Header Fix
**Problem**: Custom headers were overwriting Authorization header

**Solution**: Proper header merging in request method to preserve authentication.

## Testing Strategy

### Comprehensive Test Suite
The `test-all-tools.js` provides complete coverage:

- **Brain Management**: List, get, set active
- **Thought Operations**: Create, read, update, delete
- **Link Operations**: Create, style, update, delete  
- **Visual Properties**: Colors, thickness, direction
- **Attachments**: File uploads, URLs, content retrieval
- **Notes**: Markdown, HTML, append operations
- **Advanced Features**: Search, modifications, graph retrieval

### Test Categories
1. **Basic Operations**: Core CRUD functionality
2. **Visual Features**: Color and styling verification
3. **File Handling**: Upload/download testing
4. **Integration**: End-to-end workflows
5. **Error Handling**: Failure scenario validation

## Performance Considerations

### Efficient File Handling
- Stream-based uploads for large files
- Proper MIME type detection
- Memory-efficient binary data processing

### API Optimization
- Minimal API calls through smart batching
- Efficient JSON Patch operations
- Connection reuse for multiple operations

### Error Recovery
- Graceful degradation for visual property failures
- Detailed error messages for debugging
- Proper cleanup on operation failures

## Security Features

### Data Protection
- API keys in environment variables only
- No sensitive data in logs or console output
- Secure HTTPS communication only

### Input Validation
- Parameter type checking
- GUID format validation
- File size and type restrictions
- Proper escaping for user input

## Usage Patterns

### Creating Visual Mind Maps
```javascript
// 1. Set active brain
await set_active_brain({ brainId: "brain-id" });

// 2. Create central concept with styling
const central = await create_thought({
  name: "Project Overview",
  backgroundColor: "#0066cc",
  foregroundColor: "#ffffff",
  kind: 2  // Type
});

// 3. Add related concepts
const phase1 = await create_thought({
  name: "Phase 1: Research", 
  backgroundColor: "#66ccff",
  sourceThoughtId: central.thought.id,
  relation: 1  // Child
});

// 4. Create styled connections
await create_link({
  thoughtIdA: central.thought.id,
  thoughtIdB: phase1.thought.id,
  name: "First Phase",
  color: "#ff6600",
  thickness: 8,
  direction: 1  // A→B
});
```

### Adding Rich Content
```javascript
// Add image attachment
await add_file_attachment({
  thoughtId: thoughtId,
  filePath: "/path/to/diagram.png",
  fileName: "Architecture Diagram"
});

// Create formatted note
await create_or_update_note({
  thoughtId: thoughtId,
  markdown: `# Project Details
  
![Architecture](diagram.png)

## Status
- 🟢 **Design**: Complete
- 🟡 **Development**: In Progress  
- 🔴 **Testing**: Not Started`
});
```

## Troubleshooting

### Common Issues

1. **"Brain ID is required"**: Set active brain first or provide brainId parameter
2. **"patchDocument field required"**: Update to v1.1.0+ (fixed in recent version)
3. **File upload failures**: Check file paths and permissions
4. **Authentication errors**: Verify API key in .env file

### Debug Mode
Set `VERBOSE=true` environment variable for detailed logging:
```bash
VERBOSE=true node index.js
```

## Contributing

### Development Setup
1. Clone repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Add your TheBrain API key
5. Run tests: `node test-all-tools.js`

### Code Structure
- Follow existing modular pattern
- Add comprehensive error handling
- Include visual property support
- Update tool schemas for new features
- Add test cases for new functionality

## Support Resources

- **TheBrain API Documentation**: https://api.bra.in
- **MCP Protocol Specification**: https://modelcontextprotocol.io
- **Repository Issues**: Use GitHub issues for bug reports
- **Test Suite**: Run `test-all-tools.js` for verification
