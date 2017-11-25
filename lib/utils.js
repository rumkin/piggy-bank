exports.run = function run(fn) {
  fn()
  .then((code = 0) => {
    process.exit(code);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
};

exports.forever = new Promise(() => {});

exports.indent = function (text) {
    if (! text.length) {
        return text;
    }

    const lines = text.split(/\r?\n/).slice(1, -1);

    const match = lines[0].match(/^\s+/);
    if (! match) {
        return lines.join('\r\n');
    }
    const offset = match[0].length;

    return lines.map((line) => {
        const spaces = line.match(/^\s+/);

        if (! spaces) {
            return line;
        }
        else if (spaces[0].length < offset) {
            return line.slice(spaces[0].length);
        }
        else {
            return line.slice(offset);
        }
    }).join('\r\n');
};
