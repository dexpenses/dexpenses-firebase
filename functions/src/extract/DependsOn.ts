type Class = { new(...args: any[]): {} };

export function DependsOn(...value: Class[]) {
  return function MyClassDecorator(target: any): any {
    if (value.indexOf(target) !== -1) {
      throw new Error(`${target.name} cannot depend on itself`)
    }
    target.prototype.$dependsOn = value;
  }
}
