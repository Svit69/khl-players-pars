class AbstractContentParser {
  // Override in inheritors
  parseContent(_html) {
    throw new Error('parseContent must be implemented in a subclass');
  }
}

export default AbstractContentParser;

