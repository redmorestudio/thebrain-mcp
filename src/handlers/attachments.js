// src/handlers/attachments.js
import fs from 'fs/promises';
import path from 'path';

export async function addFileAttachment(api, args) {
  try {
    const { brainId, thoughtId, filePath, fileName } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    // Verify file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file info
    const stats = await fs.stat(filePath);
    const actualFileName = fileName || path.basename(filePath);

    await api.addFileAttachment(brainId, thoughtId, filePath, actualFileName);

    return {
      success: true,
      message: `File '${actualFileName}' attached to thought ${thoughtId}`,
      attachment: {
        fileName: actualFileName,
        filePath,
        size: stats.size,
        thoughtId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function addUrlAttachment(api, args) {
  try {
    const { brainId, thoughtId, url, name } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.addUrlAttachment(brainId, thoughtId, url, name);

    return {
      success: true,
      message: `URL '${url}' attached to thought ${thoughtId}`,
      attachment: {
        url,
        name: name || 'Auto-generated from page title',
        thoughtId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getAttachment(api, { brainId, attachmentId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const attachment = await api.getAttachment(brainId, attachmentId);
    
    return {
      success: true,
      attachment: {
        id: attachment.id,
        brainId: attachment.brainId,
        sourceId: attachment.sourceId,
        sourceType: attachment.sourceType,
        sourceTypeName: getSourceTypeName(attachment.sourceType),
        name: attachment.name,
        type: attachment.type,
        typeName: getAttachmentTypeName(attachment.type),
        location: attachment.location,
        dataLength: attachment.dataLength,
        position: attachment.position,
        isNotes: attachment.isNotes,
        creationDateTime: attachment.creationDateTime,
        modificationDateTime: attachment.modificationDateTime,
        fileModificationDateTime: attachment.fileModificationDateTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getAttachmentContent(api, args) {
  try {
    const { brainId, attachmentId, saveToPath } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const content = await api.getAttachmentContent(brainId, attachmentId);
    
    if (saveToPath) {
      // Save the content to a file
      await fs.writeFile(saveToPath, content);
      
      return {
        success: true,
        message: `Attachment content saved to ${saveToPath}`,
        savedTo: saveToPath,
        size: content.length,
      };
    } else {
      // Return content info without the actual binary data
      return {
        success: true,
        message: 'Attachment content retrieved',
        size: content.length,
        hint: 'Use saveToPath parameter to save the content to a file',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteAttachment(api, { brainId, attachmentId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.deleteAttachment(brainId, attachmentId);
    
    return {
      success: true,
      message: `Attachment ${attachmentId} deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function listAttachments(api, { brainId, thoughtId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const attachments = await api.listAttachments(brainId, thoughtId);
    
    return {
      success: true,
      count: attachments.length,
      attachments: attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        typeName: getAttachmentTypeName(att.type),
        location: att.location,
        dataLength: att.dataLength,
        isNotes: att.isNotes,
        position: att.position,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper functions
function getSourceTypeName(sourceType) {
  const types = {
    1: 'Brain',
    2: 'Thought',
    3: 'Link',
    4: 'Attachment',
    5: 'BrainSetting',
    6: 'BrainAccess',
    7: 'CalendarEvent',
    8: 'FieldInstance',
    9: 'FieldDefinition',
  };
  return types[sourceType] || 'Unknown';
}

function getAttachmentTypeName(type) {
  // Common attachment type values (these may vary based on TheBrain's implementation)
  const types = {
    0: 'File',
    1: 'URL',
    2: 'InternalFile',
    3: 'ExternalFile',
    4: 'WebLink',
  };
  return types[type] || `Type${type}`;
}