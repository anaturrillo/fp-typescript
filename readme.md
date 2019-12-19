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
      return 'Bye';
    });
};
```
Si sólo necesitamos un valor, simplemente:

```
const someFunctionTRW: FunctionReturningPromise = () =>
  myRequest()
    .then(someValue => someValue ? 'Hi' : 'Bye');
```
**ejemplos:** `examples/cases/scope`

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
      return num + 1;
    });
};
```
```
const someFunctionTRW: FunctionReturningPromise = () =>
  myRequest()
    .then(someValue => Promise.all([someValue, 0]))
    .then(([someValue, num]) => someValue ? num : num + 1);
```
**ejemplos:** `examples/cases/promiseAll`

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
              return someSyncOperation(secondResponse, someRelevantData);
            });
        });
    });
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
const validate: FunctionReturningPromise = async (response: ResponseData) => {
  try {
    await validateAsync(response);
    return response;
  } catch (e) {
    return Promise.reject(response);
  }
};

const handleFirstResponse: FunctionReturningPromise = response => someAsyncOperation(response);
const handleSecondResponse = someRelevantData => (secondResponse): GenericData =>
  someSyncOperation(secondResponse, someRelevantData);

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

**C)** En los viejos tiempos una práctica bastante común era definir una variable y popularla dependiendo de una
condición. Así:
``` 
const someFunction: SyncFunction = (someCondition: boolean) => {
  let someValue = '';

  if (someCondition) {
    someValue = 'hi';
  } else {
    someValue = 'bye';
  }

  return someValue;
};
```
Además de que ya no es necesario modificar una variable porque desde ES6 con const y let el scope es por bloque. Por lo 
podríamos hacer:
``` 
const someFunction: SyncFunction = (someCondition: boolean) => {
  if (someCondition) {
    const someValue = 'hi';
  } else {
    const someValue = 'bye';
  }

  return someValue;
};
```
Sin embargo hay mejor formas de resolver esta situación:
Teniendo en cuenta que el return termina la ejecución de una función podemos retornar directamente dentro del condicional.
```
const someFunctionTRW2: SyncFunction = (someCondition: boolean) => {
  if (someCondition) return 'hi';
  return 'bye';
};
```
Y por supuesto una forma muy limpia de hacer lo mismo es retornar una expresión:
```
const someFunctionTRW: SyncFunction = (someCondition: boolean) => someCondition ? 'hi' : 'bye';
```
Y evaluando un ejemplo con promesas, en vez de hacer:
```
const someMoreComplexFunction: FunctionWithConditionReturningPromise = (someCondition: boolean) => {
  return someAsyncOperation()
    .then(() => {
      if (someCondition)
        return someAsyncOperation()
          .then((result: GenericData) => validateAsync(result).then((isValid) => {
            if (isValid) return {};
            return Promise.reject();
          }));

      return myRequest()
        .then(response => validateAsync(response).then(isValid => {
          if (isValid) return Promise.reject();
          return {};
        }));
    });
};
```
Podríamos plantear una función:
```
const someMoreComplexFunctionTRW: FunctionReturningPromise = someCondition => {
  return someAsyncOperation()
    .then(evaluateCondition(someCondition));
}; 
```
En la que llamamos a una función cuya responsabilidad es evaluar la condición:
``` 
const evaluateCondition = condition => (): Promise =>  condition ? someOption() : someOtherOption();
```
Esta función seleccionará que "flow" ejecutar, cada uno definido en una función:
``` 
const someOption: FunctionReturningPromise = () =>
  someAsyncOperation()
    .then(otherResult => validateAsync(otherResult))
    .then(isValid => isValid ? {} : Promise.reject());

const someOtherOption: FunctionReturningPromise = () =>
  myRequest()
    .then(response => someSyncOperation(0, 1));
```
Esta aproximación logra una mejor división de responsabilidades y es más declarativa que la anterior.

**ejemplos:** `examples/cases/conditionals`

**E)** Condiciones no complejas (no me acuerdo a qué venía este punto)

``` 
Usar ejemplo de teranarios gigantes
```
 

**D)** forEach para recorrer un array.

Muchas veces vamos a necesitar modificar un array o incluso crear un objeto a partir de un array. Puede ser que 
te veas tentado de usar un forEach, porque te recuerda a tu viejo y querido for. NO LO HAGAS!
Si necesitás, por ejemplo modificar un array:

``` 
const functionToCreateNewArray = (arr: GenericData[]): GenericData[] => {
  const result = [];
  arr.forEach((item) => {
    result.push({aNumber: item.aNumber, aString: item.aString});
  });
  return result;
};
```
Lo que deberías hacer es usar map! Map recorre el array y devuelve un nuevo array:
``` 
const functionToCreateNewArrayTRW = (arr: GenericData[]): GenericData[] =>
  arr.map((e) => ({
    aNumber: e.aNumber + 1,
    aString: e.aString
  }));
```
El map simpre va a retornar un array, por eso si lo que necesitamos es crear un objeto a partir de un array.

En vez de:
``` 
const functionToCreateIndex: IndexCreator = arr => {
  const result = {};
  arr.forEach(item => {
    result[item.aNumber] = item;
  });
  return result;
};

const reducerFunction = (arr: GenericData[]): GenericData => {
  const result = {
    aNumber: 0,
    aString: ''
  };

  arr.forEach(item => {
    result.aNumber = result.aNumber + item.aNumber;
    result.aString = result.aString + item.aString;
  });

  return result;
};
```
Usá reduce!
``` 
const functionToCreateIndexTRW: IndexCreator = arr =>
  arr.reduce((index, item) => ({...index, [item.aNumber]: item}), {});

const reducerFunctionTRW = (arr: GenericData[]): GenericData =>
  arr.reduce((result, item) => ({
    aNumber: result.aNumber + item.aNumber,
    aString: result.aString + item.aString
  }), {aNumber: 0, aString: ''});
```
Programando en funcional en líneas generales deberíamos intentar evitar el forEach ya que no retorna nada, su
comportamiento puede dar resultados inesperados como el ejempl que veremos a continuación.

**F)** Await forEach.

Como mencionamos forEach() NO retorna nada, por lo tanto NO se puede awaitear, porque el await espera por el valor a
continuación, que en el caso de un forEach() es undefined.
``` 
const waitingForValues = async (items): Promise => {
  await items.forEach(item => {
    return someAsyncOperation(item);
  });
  return someAsyncOperation();
};
```
Tampoco sirve awaitear a la función dentro del forEach porque el await que en el scope del forEach y no en el de la
función que lo contiene, por lo tanto la ejecución de la función va a seguir sin esperar la resolución de la promesa.
```
const waitingForValues2 = (items): Promise => {
  items.forEach(async item => {
    await someAsyncOperation(item);
  });
  return someAsyncOperation();
};
```
Lo que estás intentando hacer es emular lo que pasa con un for:
``` 
for (let i = 0; i < items.length; i++) {
  await someAsyncOperation(items[i])
}
```
En este caso SI funciona porque el await queda en el scope de la función principal, por eso la función "sabe" que tiene
que esperar a que se resuelva esa promesa.



**G)** Hard limit para tamaño de funciones?

 (si no, se peca de imperativo). 15 LoC? Single responsability, KISS, delegación, god object, etc.

**H)** exceso de anidamiento
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