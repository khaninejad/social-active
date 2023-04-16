export class Rules {
  rules: string[] = [];
  addRole(rule: string) {
    this.rules.push(rule);
  }

  getRoles() {
    return this.rules.join("\n");
  }
}
