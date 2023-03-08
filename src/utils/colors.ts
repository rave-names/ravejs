const index = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const BGwhite = '\x1b[47m';

const getColoredText = (text: string, color: string = 'white', warn: boolean = false) => {
  // remember to add reset at the end.
  return (warn ? BGwhite : '') + color + text + index.reset;
};

export { getColoredText as color, index };
