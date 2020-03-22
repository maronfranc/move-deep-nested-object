// No magic numbers
const ZERO = 0;
const ONE = 1;

class MoveNestedObjectPath {
  constructor(arrKeysPath, obj) {
    this.arrKeysPath = Object.freeze(arrKeysPath.slice());
    this.lastArrKeysNumber = arrKeysPath.length - ONE;
    this.obj = obj;
    this.newObject;
  }

  toPlain(newKeyName = this.arrKeysPath[this.lastArrKeysNumber]) {
    if (this.arrKeysPath.length <= ONE) {
      console.error("Incomplete array of paths. At least two keys minimum.");

      return this.obj;
    }
    console.time("Find and move");

    try {
      this.recursiveFind();
      this.deletePropertyPath();

      return { ...this.obj, [newKeyName]: this.newObject };
    } catch (e) {
      console.error(e, "\nError thrown. Returning original object.");

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

    if (!objectHasKey && this.arrKeysPath.length !== index) {
      throw new Error(
        `Array of paths did not correctly match object keys:
        Last KeyName: "${currentPath}"`
      );
    }

    // loop through object keys and rerun recursiveFind() method in deeper matched objects
    for (const keyName in objToFind) {
      const currentObjectValue = objToFind[keyName];
      const isIndexInArrayLength = this.arrKeysPath.length >= index;
      const isSelectedValueAnObject = typeof currentObjectValue === "object";

      if (objectHasKey || (isIndexInArrayLength && isSelectedValueAnObject)) {
        if (currentPath === keyName) {
          if (!isSelectedValueAnObject) {
            throw new Error(
              `["${keyName}"] value in array of paths is not an object:`
            );
          }

          if (index + ONE === this.lastArrKeysNumber) {
            this.dangerouslyMutableThisObj = currentObjectValue;
          }

          console.count("Recurvise find");
          this.recursiveFind(currentObjectValue, index + ONE);
        }
      } else {
        this.newObject = { ...objToFind };
      }
    }
  }

  deletePropertyPath() {
    delete this.dangerouslyMutableThisObj[
      this.arrKeysPath[this.lastArrKeysNumber]
    ];
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
