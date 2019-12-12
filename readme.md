# Dos and don'ts

Code smells
----------------
   
 **A)** Modificar una variable fuera del scope porque necesito usarla luego del fullfilment de una promesa.
 
 Los valores que quiero usar luego de la resolución de una promesa deben ser RETORNADOS por esa promesa y tengo que
 usarlose en el scope de la siguiente función.

En el ejemplo la función del primer .then tiene **EFECTO DE LADO** (big no-no).
```
const someFunction: FunctionReturningPromise = () => {
  let someValueIWantToUseLater: ResponseData = {};

  return myRequest()
    .then(someValue => {
      someValueIWantToUseLater = someValue;
      return 'something';
    })
    .then(() => {
      if (someValueIWantToUseLater) return 'Hi';
      return 'Bye'
    })
};
```
Si sólo necesitamos un valor, simplemente:

```
const someFunctionTRW: FunctionReturningPromise = () =>
  myRequest()
    .then(someValue => someValue ? 'Hi' : 'Bye');
```
Si nuestra función necesita retornar dos valores, por ejemplo:
``` 
const someFunction: FunctionReturningPromise = () => {
    let someValueIWantToUseLater: ResponseData = {};

    return myRequest()
        .then(someValue => {
            someValueIWantToUseLater = someValue;
            return 0;
        })
        .then(num => {
            if (someValueIWantToUseLater) return num;
            return num + 1
        })
};
```
```
const someFunctionTRW: FunctionReturningPromise = () =>
    myRequest()
        .then(someValue => Promise.all([someValue, 0]))
        .then(([someValue, num]) => someValue ? num : num + 1);
```
**ejemplos:** `examples/cases/scope` y `examples/cases/promiseAll`

**B)**  "Promise hell" para mantener el scope. 
Se acuerdan del callback hell??? Bueno, welcome to promises.
Con promesas puedo de exactamente la misma manera generar el triángulo del horror.
Por ejemplo:

```
const myFuncion: FunctionReturningPromise = (someRelevantData) => {
  return myRequest()
    .then(response => {
      return validateAsync(response)
        .then(isValid => {
          return someAsyncOperation(response)
            .then(secondResponse => {
              return someSyncOperation(secondResponse, someRelevantData)
            })
        })
    })
};
```
En el ejemplo, nuestro querido programador, se alejó del promise chain para poder conservar en el scope algunas 
de las variables que iba a necesitar más adelante.
Veamos cómo podemos subsanar este problemilla:

```
const myFunctionTRW: FunctionReturningPromise = (someRelevantData) =>
  myRequest()
    .then(response => Promise.all([response, validateAsync(response)]))
    .then(([response]) => someAsyncOperation(response))
    .then(secondResponse => someSyncOperation(secondResponse, someRelevantData));
```
Con un simple Promise.all nuevamente podemos retornar múltiples valores para que estén disponibles en
el scope de la siguiente función. 

Y en un segundo ejemplo de solución extraemos cada paso a una función. De esta manera la función principal,
queda simple y sobre todo declarativa (además de que permite handlear errores parciales
de manera ordenada):
```
const validate = async response => {
  try {
    await validateAsync(response);
    return response
  } catch (e) {
    return Promise.reject()
  }
};

const handleFirstResponse = response => someAsyncOperation(response);
const handleSecondResponse = someRelevantData => secondResponse => someSyncOperation(secondResponse, someRelevantData);

const myFunctionTRW_: FunctionReturningPromise = (someRelevantData) =>
  myRequest()
    .then(validate)
    .then(handleFirstResponse)
    .then(handleSecondResponse(someRelevantData));
```
**ejemplos:** `examples/cases/promiseHell`

Posiblemente no se termine de apreciar por los desafortunados nombres que elegimos para los ejemplos,
pero imaginemos...

```
 return request(userRequest)
    .then(validateResponse)
    .then(createNewUser)
    .then(sendUserMail)
    .then(confirmEmailSent)
    .then(finishOk)
    .catch(finishError)
```
<3


**C)** Compartir estado entre funciones en una cadena .then

``` 
agregar ejemplo
```

**D)** let + condicionales para llenarlo (let x; if(a) x = 1 else x = 2;). 

Transformar a una funcion (if (a) return 1 else return 2)
``` 
agregar ejemplo
```
**E)** Crear indices/arrays nuevos usando map | reduce, no forEach.

``` 
agregar ejemplo
```

**F)** Condiciones no complejas (no me acuerdo a qué venía este punto)

``` 
agregar ejemplo
```
Usar ejemplo de teranarios gigantes

ejemplo funciones:
   // definition
   const ifElse = (expr: boolean, t: Lazy, f: Lazy) =>
     expr ? t() : f();

   // use
   const evenOrOdd = (x: number) =>
     ifElse(x % 2 === 0,
       () => 'even',
       () => 'odd');
 

**G)** Diferencias forEach, map, for(... in ...) + await + promises

WRONG!
```
 const arrayEnElQueGuardoTodo = [];
 
 await arrayConCosas.forEach(async cosa => {
    await cosa.updatear();
    arrayEnElQueGuardoTodo.push(cosa);
});

return arrayEnElQueGuardoTodo;
```
WRONG!

Explicar por qué no se puede hacer await de foreach. Comparar con un for.
mostrar ejemplo correcto con promise.all y con reduce concatenando promesas

**H)** Hard limit para tamaño de funciones?

 (si no, se peca de imperativo). 15 LoC? Single responsability, KISS, delegación, god object, etc.

**I)** exceso de anidamiento
```
ALGO ASI
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
```
   
antipatterns
--------------
**A)** abusar de los tipos genericos:

tipo any / function 

no:

```
type aThing = {
  doSomething(myFn: Function)
} 
```


si:
```
type ArithmeticFn = (a: number, b: number) => number
type aThing = {
  doSomething(myFn: ArithmeticFn)
}
```

**B)** No aprovechar el type inference / type overwriting

Supongamos que copiamos un objeto:
```
const someData: genericData = {
  aLotOfData: true,
  aNumber: 5
};

const newSomeData: genericData = {... someData};
const otherNewData = {...someData};

otherNewData.aNumber = 'hi';
```
Como podemos ver en el ejemplo, cuando declaramos `otherNewData` no necesitamos declarar el tipo,
`otherNewData.aNumber = 'hi'` tira error, porque typescript entiende que es una copia de un objeto
con un tipo en particular por inferencia de tipos. En muchos casos es mejor que el motor de typescript
infiera los tipos, porque lo va a hacer mejor que nosotros. Si no, corremos el riesgo de sobreescribir el tipo.

```
const newSomeData: any = {... someData};
newSomeData.aNumber = 'hola'; 
```
En este último ejemplo como sobreescribimos el tipo typescript no se queja si cambio el tipo de dato
de alguna de las propiedades.

Otro ejemplo de inferencia de tipos es:

``` 
type Message = {
  hello: string;
  test: string;
}

const myFunction = ({ head, ...rest }: Message) => rest;

const response = myFunction({ hello: 'world', test: 'test' });
```

En este ejemplo no necesitamos declarar el tipo de response, porque declaramos que `myFunction` recibía un objeto
del tipo `Message`, sabemos que `rest` es un string porque `test` es un string, por lo tanto sabemos que 
`response` es un string.

**ejemplos:** `examples/cases/typeInference`

**C)** Extracción del tipo de un objeto literal.

**Creo que no es una buena práctica pero capaz sirve en el contexto de una migración de JS a TS**
**Ahora que lo pienso tampoco sería un antipattern**

Puedo extraer un tipo a partir de un objeto literal:
```
const objectLiteral = {
  name: 'Juan Bautista Jr Xabadú',
  color: 'orange',
  pets: false,
  age: 102
};

type UserFromObject = typeof objectLiteral;
 
```
No puedo hacer:

```
const mrX: UserFromObject = {
  name: undefined,
  color: 2,
  pets: 5,
  age: '15'
};
```
Pero si puedo hacer:
``` 
const stu: UserFromObject = {
  name: 'Stu',
  color: 'white',
  pets: false,
  age: 54
};
```
**ejemplos:** `examples/cases/tyepExtraction`

**D)** Usar tipos genéricos cuando el tipo está atado a alguna entidad.

Supongamos que tenemos el tipo:
``` 
type User = {
  name: string,
  salary: number,
  email: string,
  retired: boolean
}
```
Si bien esta función está bien:
``` 
const getUserByEmail = (email: string) => {};
```
Sin embargo estamos perdiendo el concepto de single source of truth porque no estamos respetando
la forma del objeto User. En cambio:
``` 
const getUserByEmailTRW = (email: User["email"]) => {};
```
De esta forma, usando lookup type, email deriva siempre de User. Por lo tanto si User cambia no tengo
que preocuparme de updatear los tipos de los métodos con los que interactúa. Especialmente importante
en aplicaciones que se espera que tengan una larga vida.

**ejemplos:** `examples/cases/lookupTypes`

**E)** abusar de las clases

No tiene sentido crear una clase que vamos a instanciar una única vez, agrega una complejidad 
innecesaria. En su lugar podemos crear un objeto literal que es idiomático para JS. 
Nunca nos olvidemos de que Typescript = JS + static typing.
Si tenemos la clase:
``` 
class SomeClassWithMethod {
  validateSomething(something: string): boolean {
    return true;
  }
}

const validator = new SomeClassWithMethod();

validator.validateSomething(); // throws
validator.validateSomething(5); // trhows
validator.validateSomething(''); // OK
```
Gracias a la inferencia de tipos se comporta de la misma manera que:

```
const anObjectWithMethod = {
    validateSomething: (email: string): boolean => {
      return true;
    }
  };

anObjectWithMethod.validateSomething(); // throws
anObjectWithMethod.validateSomething(5); // throws
anObjectWithMethod.validateSomething(''); // OK
```

**ejemplos:** `examples/cases/overUseOfClasses`

 readOnly???
 VER TEMA PARTIALS ??
 
 http://ducin.it/typescript-anti-patterns
 https://dev.to/wolksoftware/why-typescript-is-a-better-option-than-javascript-when-it-comes-to-functional-programming-3mp0
 
