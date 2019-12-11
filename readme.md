# Dos and don'ts

Code smells
----------------


1 - Manejo de scope.

Casos:
 - 1 - Modificar una variable que está fuera del scope que se está trabajando.
   
   A. let + .then modificando una variable del scope superior.
   
   ``` ```
   
   B.  "Triangle of hell" para mantener el contexto
   
   ``` ```
      
   C. Compartir estado entre funciones en una cadena .then
   
   ``` ```
   
   D. let + condicionales para llenarlo (let x; if(a) x = 1 else x = 2;). Transformar a una funcion (if (a) return 1 else return 2)
   
   E. Crear indices/arrays nuevos usando map + filter + reduce, no forEach.
   
   F. Condiciones no complejas
       // definition
       const ifElse = (expr: boolean, t: Lazy, f: Lazy) =>
         expr ? t() : f();
   
       // use
       const evenOrOdd = (x: number) =>
         ifElse(x % 2 === 0,
           () => 'even',
           () => 'odd');
     
   
   G. Diferencias forEach, map, for(... in ...) + await + promises
   
   H. Hard limit para tamaño de funciones (si no, se peca de imperativo). 15 LoC? Single responsability, KISS, delegación, god object, etc.
   
   I. exeso de anidamiento
   const manySteps = (array: string[]) =>
       round(average(
           multiplyAll(doubleAll(
               roundAll(halveAll(incrementAll(convertToInt(array)))))));
               
   const manySteps = (array:string[]) =>
        array
            .map(convertToInt)
            .map(increment)
            .map(halve)
            .map(round)
    ALGO ASI
   
antipatterns
--------------
- abusar de los tipos genericos:

tipo any / function 

para no usar function Instead of:

type aThing = {
  doSomeLogic(cb: Function)
}
we should define function types, such as:

type ArithmeticFn = (a: number, b: number) => number
type aThing = {
  doSomeLogic(cb: ArithmeticFn)
}

Aprovechar el type inference

// original item to be changed in an immutable manner
const course = this.courses[0];

const newCourse: any = {...course};
newCourse.description = 'New Value!';
this.courses[0] = newCourse;

Whether we want the code to be a one-liner or not (preferences, conventions, whatever...) we should use idiomatic JavaScript and let the type inference do everything for us:

const course = this.courses[0];
const newCourse = {...course, description: 'New Value!'};
this.courses[0] = newCourse;

In this case, the object destructuring with overriding a certain field is really enough for TypeScript to infer the newCourse variable precisely. And to find out that newCourse is type compatible with course both ways :) The general rule of thumb is that sometimes removing any will allow type inference to do all the job (occurence of any is redundant and actually harmful).

EXTRACTING THE TYPE OF AN EXISTING LITERAL OBJECT
Example usecase: we're diving into a big legacy JS application. We find that there's a global config object defined like this one:

var Configuration = {
  API: "http://host/path/to/api",
  token: "jw3t-4w4j-5t04-5jt0-445t-fe98",
  locale: "en-us",
  language: "en",
  currency: "USD",
  modules: ["admin", "orders", "stock"]
}
And it's passed as an argument to many functions throughout the codebase. What type should we provide for this config?

We can define the whole type from scratch, but we don't have to. Simply, use typeof:

type AppConfig = typeof Configuration
to get the type (type AppConfig = { API: string; token: string; locale: string; lang: string; currency: string; modules: string[]; })

type Employee = {
  "id": number;
  "nationality": Nationality,
  "departmentId": number;
  "keycardId": string;
  "account": string;
  "salary": Money;
  "office": [string, string];
  "firstName": string;
  "lastName": string;
  "title": string;
  "contractType": ContractType;
  "email": Email;
  "hiredAt": DateString;
  "expiresAt": DateString;
  "personalInfo": {
    "age": number;
    "phone": Phone;
    "email": Email;
    "dateOfBirth": DateString;
    "address": {
      "street": string;
      "city": string;
      "country": string;
    };
  },
  "skills": Skill[];
  "bio": string;
};
LOOKUP TYPES
Example usecase: need to fetch employees that are assigned to a certain department ("departmentId": number).

Although the following should work:

const getEmployeesByDepartmentId = (departmentId: number): Response { ... }
it's not a good idea to do it, because it will work now. That's not easy to spot, but in the code above we're losing the single source of truth about the Employee entity shape, when introducing a loose number.

The departmentId should be a derivative of the Employee entity, in TypeScript we call it a lookup type (we could optionally create a separate typedef for this field's type):

const getEmployeesByDepartmentId = (departmentId: Employee["departmentId"]): Response { ... }
Thanks to it, whenever the Employee entity gets updated, all places that depend on its derivatives get updated and potentially our components/redux/ngrx/whatever code will throw errors, since number is now expected to be a string (guid). If we leave just departmentId: number, we get a silent fail. o_O

That's a good strategy especially for long-living, big applications that are likely to evolve over time. Just keep the single source of truth.

You should always leave the compiler automatically deduce the type for you and avoid being explicit as much as possible because the compiler often knows better than you what type it is. If you want to know the type at any time in your program, good IDEs (VSCode 🙂) will have a tooltip integration which will give you this information.

ejemplo de inferencia de tipos
interface Hello {
  world: string;
  test: string;
}
const myFunction = ({ test, ...rest }: Hello) => rest;
const res = myFunction({ world: 'world', test: 'test' });
// res is of type { world: string; }

In the above code snippet, typescript inferred the type of our rest object in myFunction which is the interface Hello without the prop test (being extracted by the destruct). Therefore Typescript inferred the returned type of the function itself. This way we ended up with a constant res of type { world: string; }






https://immutable-js.github.io/immutable-js/



- abusar de las clases:
 it's some complexity which doesn't have to be there (see accidental complexity).
 if we need only a single instance, we can define an object literal, thereby removing the need for calling the constructor. We can have the instance straight away. Using object literals is idiomatic JavaScript. And TypeScript is just JavaScript + static typing.
 Type safety for classes is great:
 
 class MyValidator {
     validateEmail(email: string): boolean { 
         return true; // :P
     }
 }
 
 const validator = new MyValidator()
 validator.validateEmail() // throws
 but type safety for object literals - thanks to type inference - is just as well. We don't lose anything:
 
 const myValidator = {
     validateEmail(email: string): boolean { 
         return true; // :P
     }
 }
 
 validator.validateEmail() // throws
 Basically, let's not overcomplicate our code. You might not need a class, if an object literal - or even a set of functions (if the object was meant to be stateless) - would do the job.
 
 
 
 readOnly???
 VER TEMA PARTIALS
 immutable????
 
 http://ducin.it/typescript-anti-patterns
 https://dev.to/wolksoftware/why-typescript-is-a-better-option-than-javascript-when-it-comes-to-functional-programming-3mp0
 
