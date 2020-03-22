// No magic numbers
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

    this.recursiveFind();

    this.deletePropertyPath(this.obj, this.arrKeysPath);

    console.timeEnd("Find and move time");
    return { ...this.obj, [newKeyName]: this.foundObject };
  }

  recursiveFind(objToFind = this.obj, index = ZERO) {
    const currentPath = this.arrKeysPath[index];
    const objectHasKey = Object.prototype.hasOwnProperty.call(
      objToFind,
      currentPath
    );

    if (!objectHasKey && this.arrKeyLength !== index) {
      throw new Error(
        `Array of paths did not correctly match object keys:
        Last KeyName: "${currentPath}"`
      );
    }

    // loop through object keys and rerun recursiveFind() method in deeper matched objects
    for (const keyName in objToFind) {
      const currentObjectValue = objToFind[keyName];
      const isIndexInArrayLength = this.arrKeyLength >= index;
      const isSelectedValueAnObject = typeof currentObjectValue === "object";

      if (objectHasKey || (isIndexInArrayLength && isSelectedValueAnObject)) {
        console.count("Loop search");
        if (currentPath === keyName) {
          if (!isSelectedValueAnObject) {
            throw new Error(
              `{ ${keyName} } value in array of paths is not an object:`
            );
          }

          this.recursiveFind(currentObjectValue, index + ONE);
        }
      } else {
        this.foundObject = { ...objToFind };
      }
    }
  }

  deletePropertyPath(obj, path) {
    if (obj === undefined || typeof obj !== "object") {
      throw new Error("Tried to delete with invalid object");
    }

    if (path === undefined) {
      throw new Error("Tried to delete with undefined array paths");
    }

    for (let i = ZERO; i < path.length - ONE; i++) {
      obj = obj[path[i]];

      if (typeof obj === "undefined") {
        return;
      }
    }

    const arrKeyCopy = [...this.arrKeysPath];
    delete obj[arrKeyCopy.pop()];
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
