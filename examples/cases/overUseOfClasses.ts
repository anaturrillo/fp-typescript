
class SomeClassWithMethod {
  validateSomething(something: string): boolean {
    return true;
  }
}

const validator = new SomeClassWithMethod();

validator.validateSomething();
validator.validateSomething(5);
validator.validateSomething('');

const anObjectWithMethod = {
    validateSomething: (email: string): boolean => {
      return true;
    }
  };

anObjectWithMethod.validateSomething();
anObjectWithMethod.validateSomething(5);
anObjectWithMethod.validateSomething('');

