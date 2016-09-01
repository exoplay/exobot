#!/usr/bin/env node

const spawn = require('child_process').spawn;
const blueprintsPath = `${__dirname}/blueprints.config.js`;
let build;
const buildArgs = ['-b', blueprintsPath, '-p'];
if (process.argv.length > 2) {
  if (process.argv[2] === '-w' || process.argv[2] === '--watch') {
    buildArgs.push('-w');
  }
}

if (process.platform === 'win32') {
  build = spawn('blueprints', buildArgs, {shell: 'cmd.exe'});
} else {
  build = spawn('blueprints', buildArgs);
}

build.stdout.on('data', (data) => {
  console.log(data.toString());
});

build.stderr.on('data', (data) => {
  console.log(data.toString());
});

build.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
