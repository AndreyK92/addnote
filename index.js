'use strict';

// TODO: move to config file
// improve messaging
const NOTE_ENV_DOMAIN = 'ADD_NOTE_DOMAIN';
const NO_DOMAIN_MESSAGE = 'NO DOMAIN';
const NO_ENTRY_MESSAGE = 'NO ENTRY SPECIFIED';
const NO_CMD_SPEC = 'NO COMMAND SPECIFIED';
const NO_SUCH_NOTE = 'NO SUCH NOTE';

const ERROR_ADDING_ENTRY = 'ERROR ADDING ENTRY';
const ERROR_CHECKING_NOTES = 'ERRO CHECKING NOTE';

const baseDir = process.cwd() + '/domains/'; 
const commandList = ['add', 'check'];
const internalDelim = '[add_note_spacebar]';

//////////// End config file seciton ////////////

// TODO: define utils separately
if(typeof String.prototype.replaceAll === 'undefined')
  String.prototype.replaceAll = function(target, replacement) {
    let str = this.slice();
    while(str.includes(target))
      str = str.replace(target, replacement);
    return str;
  };

/*
 * Get command line args
 * @param {string|array} args. argument names
 *
 * @return {array}. An array of passed args
 */
const getArgs = args => {
  if(typeof args === 'string')
    args = args.split(' ');

  const cmdStr = process.argv.map(arg => {
                                if(arg.split(' ').length > 1) {
                                  return arg.replace(/ /g, internalDelim);
                                } else return arg;
                              })
                             .slice(3)
                             .join(' ')
                             //.replace(/'.[^\s]*(\s)/g, '[add_note_spacebar]')
                             .replace(/\s+/g, ' ');

  let _args = {};
  args.reduce((acc, val) => {
    const _val = '-' + val;

    if(cmdStr.includes(_val)) {
      const s = cmdStr.indexOf(_val) + _val.length + 1;
      let len = cmdStr.indexOf(' ', s + 1);

      if(len < 0) 
        len = cmdStr.length;

      return acc.concat(cmdStr.substring(s, len));
    }

    return acc;
  }, []).map((arg, index) => {
    _args[args[index]] = arg;
  });

  return _args;
};

// TODO: Create a list of options
let cmdArgs = getArgs(['D', 'e']);
if(process.argv[2] === 'undefined' 
    || !commandList.includes(process.argv[2])) {
      
  console.log(NO_CMD_SPEC);
  process.exit(1);
}
cmdArgs.command = process.argv[2];

// Check the domain arg
const domain = (typeof cmdArgs.D !== 'undefined'
                 ? cmdArgs.D : process.env[NOTE_ENV_DOMAIN]);
if(!domain || typeof domain === 'undefined') {
  console.log(NO_DOMAIN_MESSAGE);
  process.exit(1);
}

const fs = require('file-system');
const notePath = baseDir + domain;

// Add to the domains notes
const add = () => {
// Check the entry arg
  const entry = (cmdArgs.e + '\r\n').replaceAll(internalDelim, ' ');
  if(!entry || typeof entry === 'undefined') {
    console.log(NO_ENTRY_MESSAGE);
    process.exit(1);
  }

  if(fs.existsSync(notePath)) {
    fs.appendFile(notePath, entry, err => {
      if(err) {
        console.log(ERROR_ADDING_ENTRY + err);
        process.exit(1);
      } console.log('Entry Added');
    });   
  } else {
    fs.writeFileSync(notePath, entry, err => {
      if(err) {
        console.log(ERROR_ADDING_ENTRY);
        process.exit(1);
      } console.log('Entry Added');
    });
  }
};

const check = () => {
  if(!fs.existsSync(notePath)) {
    console.log(NO_SUCH_NOTE);
    return;
  }
  try {
    const buffer = fs.readFileSync(notePath).toString();
    console.log(buffer);
  } catch(e) {
    console.log(ERROR_CHECKING_NOTES);
    process.exit(1);
  } 
};

switch(cmdArgs.command) {
  case 'add': add();
    break;
  case 'check': check();
    break;
}
