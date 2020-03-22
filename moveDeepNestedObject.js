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
    console.time("Find and move");

    try {
      this.recursiveFind();

      this.deletePropertyPath(this.obj, this.arrKeysPath);

      return { ...this.obj, [newKeyName]: this.foundObject };
    } catch (e) {
      console.error(e);
      console.error("Error thrown. Returning original object.");
      return this.obj;
    } finally {
      console.timeEnd("Find and move");
    }
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
        if (currentPath === keyName) {
          if (!isSelectedValueAnObject) {
            throw new Error(
              `["${keyName}"] value in array of paths is not an object:`
            );
          }

          console.count("Recurvise find");
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
    id: 120,
    country: {
      id: 55,
      state: {
        id: 25,
        name: "State Name",
        city: {
          id: 2150,
          name: "City Name"
        },
        region: {
          id: 3,
          name: "South"
        }
      }
    }
  }
};

const print = obj => console.log(JSON.stringify(obj, null, 2));

const plainCity = new MoveNestedObjectPath(
  ["address", "country", "state", "city"],
  user
).toPlain();

print(plainCity);

const plainCityAndRegion = new MoveNestedObjectPath(
  ["address", "country", "state", "region"],
  plainCity
).toPlain();

print(plainCityAndRegion);
