// src/handlers/notes.js

export async function getNote(api, args) {
  try {
    const { brainId, thoughtId, format = 'markdown' } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    const note = await api.getNote(brainId, thoughtId, format);
    
    return {
      success: true,
      note: {
        brainId: note.brainId,
        thoughtId: note.sourceId,
        format,
        content: note[format] || note.markdown || note.text || '',
        modificationDateTime: note.modificationDateTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function createOrUpdateNote(api, args) {
  try {
    const { brainId, thoughtId, markdown } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.createOrUpdateNote(brainId, thoughtId, markdown);
    
    return {
      success: true,
      message: `Note for thought ${thoughtId} updated successfully`,
      thoughtId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function appendToNote(api, args) {
  try {
    const { brainId, thoughtId, markdown } = args;

    if (!brainId) {
      throw new Error('Brain ID is required');
    }

    await api.appendToNote(brainId, thoughtId, markdown);
    
    return {
      success: true,
      message: `Content appended to note for thought ${thoughtId}`,
      thoughtId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}