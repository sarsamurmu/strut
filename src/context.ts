class Context {
  contextData: Map<any, any>;

  constructor(fromMap?: Map<any, any>) {
    this.contextData = new Map();

    if (fromMap) {
      fromMap.forEach((key, value) => {
        this.contextData.set(key, value);
      });
    }
  }

  set(key: any, value: any) {
    this.contextData.set(key, value);
  }

  get(key: any) {
    return this.contextData.get(key);
  }

  copy() {
    return new Context(this.contextData);
  }
}

export { Context }
