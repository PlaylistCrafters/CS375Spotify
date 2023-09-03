function generateRandomString(len) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function getXRandomItems(iterable, length) {
  return Array.from(iterable)
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, length);
}

function getXRandomItem(iterable) {
  const array = Array.from(iterable);
  if (array.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getRandomKey(obj) {
  const keys = Object.keys(obj);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

function findCommonValuesFromLists(lists) {
  return lists.reduce((commonValues, currentList) => {
    return commonValues.filter((value) => currentList.includes(value));
  }, lists[0]);
}

function extractListsByKey(objects, key) {
  return objects
    .filter((obj) => obj.hasOwnProperty(key) && Array.isArray(obj[key]))
    .map((obj) => obj[key]);
}

module.exports = {
  generateRandomString,
  getXRandomItems,
  getXRandomItem,
  getRandomKey,
  findCommonValuesFromLists,
  extractListsByKey,
};
