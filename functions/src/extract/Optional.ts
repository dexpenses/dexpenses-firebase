export class Optional<T> {
  public static none<T>(): Optional<T> {
    return new Optional();
  }
  constructor(private value?: T) {}
  public then<U>(mapper: (value: T) => U): U | null {
    if (!this.value) {
      return null;
    }
    return mapper(this.value);
  }
  public asIs(): T | null {
    if (!this.value) {
      return null;
    }
    return this.value;
  }
}
