// src/handlers/thoughts.js

export async function listBrains(api) {
  try {
    const brains = await api.listBrains();
    return {
      success: true,
      brains: brains.map(brain => ({
        id: brain.id,
        name: brain.name,
        homeThoughtId: brain.homeThoughtId,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getBrain(api, { brainId }) {
  try {
    const brain = await api.getBrain(brainId);
    return {
      success: true,
      brain: {
        id: brain.id,
        name: brain.name,
        homeThoughtId: brain.homeThoughtId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function setActiveBrain(api, { brainId }) {
  try {
    // Verify brain exists
    await api.getBrain(brainId);
    return {
      success: true,
      message: `Active brain set to ${brainId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to set active brain: ${error.message}`,
    };
  }
}

export async function createThought(api, args) {
  try {
    const {
      brainId,
      name,
      kind = 1, // Default to Normal
      label,
      foregroundColor,
      backgroundColor,
      typeId,
      sourceThoughtId,
      relation,
      acType = 0, // Default to Public
    } = args;

    if (!brainId) {
      throw new Error('Brain ID is required. Use set_active_brain first or provide brainId.');
    }

    const thoughtData = {
      name,
      kind,
      acType,
    };

    // Add optional properties
    if (label) thoughtData.label = label;
    if (typeId) thoughtData.typeId = typeId;
    if (sourceThoughtId) {
      thoughtData.sourceThoughtId = sourceThoughtId;
      thoughtData.relation = relation || 1; // Default to Child
    }

    // Create the thought
    const result = await api.createThought(brainId, thoughtData);
    const thoughtId = result.id;

    // Apply visual properties if provided
    if (foregroundColor || backgroundColor) {
      const updates = {};
      if (foregroundColor) updates.foregroundColor = foregroundColor;
      if (backgroundColor) updates.backgroundColor = backgroundColor;
      
      await api.updateThought(brainId, thoughtId, updates);
    }

    return {
      success: true,
      thought: {
        id: thoughtId,
        name,
        brainId,
        ...thoughtData,
        ...(foregroundColor && { foregroundColor }),
        ...(backgroundColor && { backgroundColor }),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getThought(api, { brainId, thoughtId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const thought = await api.getThought(brainId, thoughtId);
    
    return {
      success: true,
      thought: {
        id: thought.id,
        brainId: thought.brainId,
        name: thought.name,
        label: thought.label,
        kind: thought.kind,
        kindName: getKindName(thought.kind),
        typeId: thought.typeId,
        foregroundColor: thought.foregroundColor,
        backgroundColor: thought.backgroundColor,
        acType: thought.acType,
        acTypeName: thought.acType === 0 ? 'Public' : 'Private',
        creationDateTime: thought.creationDateTime,
        modificationDateTime: thought.modificationDateTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateThought(api, args) {
  try {
    const {
      brainId,
      thoughtId,
      name,
      label,
      foregroundColor,
      backgroundColor,
      kind,
      acType,
      typeId,
    } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const updates = {};
    
    // Build update object with only provided fields
    if (name !== undefined) updates.name = name;
    if (label !== undefined) updates.label = label;
    if (foregroundColor !== undefined) updates.foregroundColor = foregroundColor;
    if (backgroundColor !== undefined) updates.backgroundColor = backgroundColor;
    if (kind !== undefined) updates.kind = kind;
    if (acType !== undefined) updates.acType = acType;
    if (typeId !== undefined) updates.typeId = typeId;

    await api.updateThought(brainId, thoughtId, updates);

    return {
      success: true,
      message: `Thought ${thoughtId} updated successfully`,
      updates,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteThought(api, { brainId, thoughtId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.deleteThought(brainId, thoughtId);
    
    return {
      success: true,
      message: `Thought ${thoughtId} deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function searchThoughts(api, args) {
  try {
    const {
      brainId,
      queryText,
      maxResults = 30,
      onlySearchThoughtNames = false,
    } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const results = await api.searchThoughts(
      brainId,
      queryText,
      maxResults,
      onlySearchThoughtNames
    );

    return {
      success: true,
      count: results.length,
      results: results.map(result => ({
        thoughtId: result.sourceThought?.id,
        name: result.name || result.sourceThought?.name,
        type: getSearchResultTypeName(result.searchResultType),
        snippet: result.snippet,
        attachmentId: result.attachmentId,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getThoughtGraph(api, { brainId, thoughtId, includeSiblings = false }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const graph = await api.getThoughtGraph(brainId, thoughtId, includeSiblings);
    
    return {
      success: true,
      graph: {
        activeThought: formatThought(graph.activeThought),
        parents: graph.parents?.map(formatThought) || [],
        children: graph.children?.map(formatThought) || [],
        jumps: graph.jumps?.map(formatThought) || [],
        siblings: graph.siblings?.map(formatThought) || [],
        tags: graph.tags?.map(formatThought) || [],
        type: graph.type ? formatThought(graph.type) : null,
        links: graph.links?.map(formatLink) || [],
        attachments: graph.attachments?.map(formatAttachment) || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getTypes(api, { brainId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const types = await api.getTypes(brainId);
    
    return {
      success: true,
      types: types.map(formatThought),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getTags(api, { brainId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const tags = await api.getTags(brainId);
    
    return {
      success: true,
      tags: tags.map(formatThought),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper functions
function getKindName(kind) {
  const kinds = {
    1: 'Normal',
    2: 'Type',
    3: 'Event',
    4: 'Tag',
    5: 'System',
  };
  return kinds[kind] || 'Unknown';
}

function getSearchResultTypeName(type) {
  const types = [
    'Unknown',
    'Thought',
    'Link',
    'Attachment',
    'Note',
    'Label',
    'Type',
    'Tag',
  ];
  return types[type] || 'Unknown';
}

function formatThought(thought) {
  if (!thought) return null;
  
  return {
    id: thought.id,
    name: thought.name,
    label: thought.label,
    kind: thought.kind,
    kindName: getKindName(thought.kind),
    foregroundColor: thought.foregroundColor,
    backgroundColor: thought.backgroundColor,
  };
}

function formatLink(link) {
  return {
    id: link.id,
    thoughtIdA: link.thoughtIdA,
    thoughtIdB: link.thoughtIdB,
    name: link.name,
    color: link.color,
    thickness: link.thickness,
    relation: link.relation,
    direction: link.direction,
  };
}

function formatAttachment(attachment) {
  return {
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    location: attachment.location,
    dataLength: attachment.dataLength,
  };
}