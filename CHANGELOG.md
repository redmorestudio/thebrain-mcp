# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-18

### 🎉 Major Fixes - JSON Patch Format Resolution

#### Fixed
- **Critical Bug**: Fixed JSON Patch format for update operations
  - `update_thought` no longer returns "patchDocument field required" error
  - `update_link` no longer returns "patchDocument field required" error
  - Root cause: TheBrain API expects `{"patchDocument": [...]}` structure, not direct patch array

#### Enhanced  
- **Full-Featured Create Operations**: 
  - `create_thought` now works with all visual properties (backgroundColor, foregroundColor, etc.)
  - `create_link` now works with all visual properties (color, thickness, direction, etc.)
  - Both functions use two-step process: create basic object, then apply visual properties via update

#### Technical Details
- **API Integration**: Fixed request body format in `src/api-client.js`
- **Before**: `body: [patch_operations]` 
- **After**: `body: { "patchDocument": [patch_operations] }`
- **Content-Type**: Removed incorrect `application/json-patch+json`, now uses standard `application/json`

#### Testing
- ✅ Comprehensive test suite confirms all update operations working
- ✅ Full-featured create operations tested with visual properties
- ✅ All previously broken functionality now operational

#### Commits
- `8907035` - Fix JSON Patch format for update operations
- `1d127b2` - Fix critical bug: Authorization header was being overwritten by custom headers  
- `e479f88` - Fix MCP tool result format - use direct string in text field, not nested object

## [1.0.0] - 2025-04-07

### Added
- **Initial Implementation**: Complete TheBrain MCP server
- **Brain Management**: List, get, set active brain, statistics
- **Thought Operations**: Create, read, update, delete with visual properties
- **Link Operations**: Create styled links with colors, thickness, direction
- **Attachment Management**: File uploads, URL attachments, content retrieval
- **Note Operations**: Markdown support, HTML export, append functionality
- **Search**: Full-text search across thoughts, notes, attachments
- **Visual Features**: 
  - Thought colors (foreground/background)
  - Link styling (color, thickness, direction)
  - Thought kinds and types
  - Rich formatting support

### Technical Implementation
- **MCP Protocol**: Full compliance with Model Context Protocol
- **REST API**: Complete TheBrain API integration
- **File Handling**: Multipart form data for uploads
- **Error Handling**: Comprehensive error messages
- **Modular Architecture**: Separated handlers for each feature domain

### Documentation
- **README**: Comprehensive usage guide with examples
- **API Reference**: Complete tool documentation
- **Visual Property Guide**: Color codes, thickness values, direction flags
- **Usage Examples**: Mind mapping, visual content creation
