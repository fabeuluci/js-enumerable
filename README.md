js-enumerable
====

Simple lazy typescript enumerable at javascript arrays.

API
----

Module exports $A function, which returns IEnumarable interface.

Example
---

```typescript
import {$A} from "js-enumerable";

let array = ["abc", "zxc", "array", "john"];
let $a = $A(array).findAll(x => x.startsWith("a")).map(x => x.length);

console.log($a.toArray()); //prints 3, 4

array.push("attribute");

console.log($a.toArray()); //prints 3, 4, 9
```

License
---

The MIT License (MIT)
