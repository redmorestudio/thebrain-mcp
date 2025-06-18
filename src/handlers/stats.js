// src/handlers/stats.js

export async function getBrainStats(api, { brainId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const stats = await api.getBrainStats(brainId);
    
    return {
      success: true,
      stats: {
        brainName: stats.brainName,
        brainId: stats.brainId,
        dateGenerated: stats.dateGenerated,
        thoughts: stats.thoughts,
        forgottenThoughts: stats.forgottenThoughts,
        links: stats.links,
        linksPerThought: stats.linksPerThought,
        thoughtTypes: stats.thoughtTypes,
        linkTypes: stats.linkTypes,
        tags: stats.tags,
        notes: stats.notes,
        attachments: {
          internalFiles: stats.internalFiles,
          internalFolders: stats.internalFolders,
          externalFiles: stats.externalFiles,
          externalFolders: stats.externalFolders,
          webLinks: stats.webLinks,
          totalInternalSize: formatBytes(stats.internalFilesSize),
          totalIconSize: formatBytes(stats.iconsFilesSize),
        },
        visual: {
          assignedIcons: stats.assignedIcons,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getModifications(api, args) {
  try {
    const { brainId, maxLogs = 100, startTime, endTime } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const modifications = await api.getBrainModifications(brainId, {
      maxLogs,
      startTime,
      endTime,
    });
    
    return {
      success: true,
      count: modifications.length,
      modifications: modifications.map(mod => ({
        sourceId: mod.sourceId,
        sourceType: mod.sourceType,
        sourceTypeName: getEntityTypeName(mod.sourceType),
        modType: mod.modType,
        modTypeName: getModificationTypeName(mod.modType),
        oldValue: mod.oldValue,
        newValue: mod.newValue,
        userId: mod.userId,
        creationDateTime: mod.creationDateTime,
        modificationDateTime: mod.modificationDateTime,
        extraAId: mod.extraAId,
        extraBId: mod.extraBId,
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
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getEntityTypeName(type) {
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
    '-1': 'Unknown',
  };
  return types[type] || 'Unknown';
}

function getModificationTypeName(type) {
  const types = {
    // Generic Actions
    101: 'Created',
    102: 'Deleted',
    103: 'Changed Name',
    104: 'Created By Paste',
    105: 'Modified By Paste',
    
    // Thoughts and Links
    201: 'Changed Color',
    202: 'Changed Label',
    203: 'Set Type',
    204: 'Changed Color2',
    205: 'Created Icon',
    206: 'Deleted Icon',
    207: 'Changed Icon',
    
    // Thought Specific
    301: 'Forgot',
    302: 'Remembered',
    303: 'Changed Access Type',
    304: 'Changed Kind',
    
    // Link Specific
    401: 'Changed Thickness',
    402: 'Moved Link',
    403: 'Changed Direction',
    404: 'Changed Meaning',
    405: 'Changed Relation',
    
    // Attachment Specific
    501: 'Changed Content',
    502: 'Changed Location',
    503: 'Changed Position',
    
    // Note Specific
    801: 'Created Note',
    802: 'Deleted Note',
    803: 'Changed Note',
  };
  return types[type] || `ModType${type}`;
}