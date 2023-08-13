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

module.exports = {
  generateRandomString,
  getXRandomItems,
};
