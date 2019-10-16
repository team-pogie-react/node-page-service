export class ApplicationError extends Error {
  constructor(...args) {
    super(...args);

    this.name = this.constructor.name;
  }
}
