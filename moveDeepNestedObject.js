const ZERO = 0;
const ONE = 1;

class MoveNestedObjectPath {
  constructor(arrKeysPath, obj) {
    this.arrKeysPath = Object.freeze(arrKeysPath.slice());
    this.arrKeyLength = arrKeysPath.length;
    this.obj = obj;
    this.foundObject;
  }

  toPlain(newKeyName = this.arrKeysPath[this.arrKeyLength - ONE]) {
    console.time("Find and move time");

    const arrKeyCopy = [...this.arrKeysPath];
    this.recursiveFind();

    this.deletePropertyPath(this.obj, arrKeyCopy);

    console.timeEnd("Find and move time");
    return { ...this.obj, [newKeyName]: this.foundObject };
  }

  recursiveFind(objToFind = this.obj, index = ZERO) {
    const objectHasKey = Object.prototype.hasOwnProperty.call(
      objToFind,
      this.arrKeysPath[index]
    );

    if (!objectHasKey && this.arrKeyLength !== index) {
      throw new Error(
        `Array of paths did not correctly match object keys
        Last KeyName: "${this.arrKeysPath[index]}"`
      );
    }

    for (const keyName in objToFind) {
      if (
        objectHasKey ||
        (this.arrKeyLength >= index && typeof objToFind[keyName] === "object")
      ) {
        console.count("Recursive search");
        if (this.arrKeysPath[index] === keyName) {
          this.recursiveFind(objToFind[keyName], index + ONE);
        }
      } else {
        this.foundObject = { ...objToFind };
      }
    }
  }

  deletePropertyPath(obj, path) {
    if (obj === undefined || path === undefined) {
      return;
    }

    for (let i = ZERO; i < path.length - ONE; i++) {
      obj = obj[path[i]];

      if (typeof obj === "undefined") {
        return;
      }
    }

    delete obj[path.pop()];
  }
}

const user = {
  id: 123,
  email: "email@email.com",
  address: {
    id: 1111,
    country: {
      id: 55,
      state: {
        id: 3333,
        city: {
          id: 25,
          name: "City Name"
        },
        region: {
          id: 4,
          name: "South"
        }
      }
    }
  }
};

const plainCity = new MoveNestedObjectPath(
  ["address", "country", "state", "city"],
  user
).toPlain();

console.log(JSON.stringify(plainCity, null, 2));
