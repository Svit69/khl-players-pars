class AbstractContentParser {
  parseContent(_html) {
    throw new Error('Метод parseContent должен быть реализован в наследнике');
  }
}

export default AbstractContentParser;
