export default class IdGenerator {
  private currentId: number = 0;

  public next(): string {
    const idString = this.currentId.toString().padStart(4, '0');
    this.currentId += 1;
    return idString;
  }
}
