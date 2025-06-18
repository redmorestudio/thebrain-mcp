// src/handlers/links.js

export async function createLink(api, args) {
  try {
    const {
      brainId,
      thoughtIdA,
      thoughtIdB,
      relation,
      name,
      color,
      thickness,
      direction,
      typeId,
    } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    // Create the basic link
    const linkData = {
      thoughtIdA,
      thoughtIdB,
      relation,
    };

    if (name) linkData.name = name;

    const result = await api.createLink(brainId, linkData);
    const linkId = result.id;

    // Apply visual properties if provided
    if (color || thickness || direction || typeId) {
      const updates = {};
      if (color) updates.color = color;
      if (thickness !== undefined) updates.thickness = thickness;
      if (direction !== undefined) updates.direction = direction;
      if (typeId) updates.typeId = typeId;
      
      await api.updateLink(brainId, linkId, updates);
    }

    return {
      success: true,
      link: {
        id: linkId,
        brainId,
        thoughtIdA,
        thoughtIdB,
        relation,
        relationName: getRelationName(relation),
        name,
        color,
        thickness,
        direction,
        directionInfo: getDirectionInfo(direction),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateLink(api, args) {
  try {
    const {
      brainId,
      linkId,
      name,
      color,
      thickness,
      direction,
      relation,
    } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const updates = {};
    
    // Build update object with only provided fields
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (thickness !== undefined) updates.thickness = thickness;
    if (direction !== undefined) updates.direction = direction;
    if (relation !== undefined) updates.relation = relation;

    await api.updateLink(brainId, linkId, updates);

    return {
      success: true,
      message: `Link ${linkId} updated successfully`,
      updates: {
        ...updates,
        ...(relation && { relationName: getRelationName(relation) }),
        ...(direction !== undefined && { directionInfo: getDirectionInfo(direction) }),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getLink(api, { brainId, linkId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const link = await api.getLink(brainId, linkId);
    
    return {
      success: true,
      link: {
        id: link.id,
        brainId: link.brainId,
        thoughtIdA: link.thoughtIdA,
        thoughtIdB: link.thoughtIdB,
        name: link.name,
        color: link.color,
        thickness: link.thickness,
        relation: link.relation,
        relationName: getRelationName(link.relation),
        direction: link.direction,
        directionInfo: getDirectionInfo(link.direction),
        meaning: link.meaning,
        meaningName: getMeaningName(link.meaning),
        kind: link.kind,
        kindName: link.kind === 1 ? 'Normal' : 'Type',
        typeId: link.typeId,
        creationDateTime: link.creationDateTime,
        modificationDateTime: link.modificationDateTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteLink(api, { brainId, linkId }) {
  try {
    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.deleteLink(brainId, linkId);
    
    return {
      success: true,
      message: `Link ${linkId} deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper functions for link properties
function getRelationName(relation) {
  const relations = {
    1: 'Child',
    2: 'Parent',
    3: 'Jump',
    4: 'Sibling',
  };
  return relations[relation] || 'Unknown';
}

function getDirectionInfo(direction) {
  if (direction === undefined || direction === null) return null;
  
  const info = {
    value: direction,
    isDirected: (direction & 1) === 1,
    isBackward: (direction & 2) === 2,
    isOneWay: (direction & 4) === 4,
  };
  
  // Build description
  const parts = [];
  if (info.isDirected) {
    parts.push(info.isBackward ? 'B→A' : 'A→B');
  } else {
    parts.push('Undirected');
  }
  
  if (info.isOneWay) {
    parts.push('One-Way');
  }
  
  info.description = parts.join(', ');
  return info;
}

function getMeaningName(meaning) {
  const meanings = {
    1: 'Normal',
    2: 'InstanceOf',
    3: 'TypeOf',
    4: 'HasEvent',
    5: 'HasTag',
    6: 'System',
    7: 'SubTagOf',
  };
  return meanings[meaning] || 'Unknown';
}

// Example usage patterns for direction:
// - Undirected link: direction = 0
// - Directed A→B: direction = 1
// - Directed B→A: direction = 3 (1 + 2)
// - One-way A→B: direction = 5 (1 + 4)
// - One-way B→A: direction = 7 (1 + 2 + 4)