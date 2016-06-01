# Exobot

An ES6+ chatbot. Requires Node ^6.2.

## Installation

* `npm install --save @exoplay/exobot`

## A Brief Example

```javascript
const Log = require('log');

const { Exobot, adapters, plugins } = require('../exobot');
const { Help, Greetings } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const HTTP_LISTENER_PORT = process.env.PORT || '8080';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || Log.INFO;

const shell = adapters.Shell;

const bot = new Exobot(BOT_NAME, {
  alias: BOT_ALIAS,
  adapters: [
    new shell(),
  ],
  plugins: [
    new Help(),
    new Greetings(),
  ],
  port: HTTP_LISTENER_PORT,
  logLevel: LOG_LEVEL,
});

module.exports = bot;
```

```
$ node index.js
> Chat: hi, exobot
> exobot: hi, shell!
```


What did we do there?

* Created a file named `index.js`
* Imported the `Exobot` class, service adapters, and plugins
* Initialized a new bot, passing in its name, configured service adapters and
  plugins, and configured an HTTP port
* Started the bot
* Ran `node index.js` and interacted with the bot

## Getting started

The easiest way to start is copy the example above - this will get you started
with a chatbot with a shell adapter. The shell adapter will start an
interactive console with which you can chat in a single "room"; Exobot will
respond to messages that trigger plugins.

1. Make a directory somewhere that you want to keep your bot's configuration
  code.
2. Run `git init` (or source control initialization method of choice), then
  `npm init` to start up an NPM package. (You probably won't publish your bot
  as its own package - but this will create a `package.json` file that contains
  your dependencies.)
3. Run `npm install --save @exoplay/exobot` to install the chatbot.
4. Copy the example above to `index.js`.
5. Run `node index.js`. Chat with yourself for a while, then read on to learn
  how to configure your chatbot, or even build your own plugins and adapters.

## Configuration

## Building adapters

## Building plugins

## Acknowledgements

Exobot is loosely based on [hubot](https://github.com/github/hubot), for which
the author has a great deal of admiration. Hubot is more user-friendly in many
ways (autoloading scripts, for example, instead of requiring the user to write
their own imports and configuration). In other ways, this flexibility can be
limiting; it's easier to make a pure-js bot more efficient and testable (and
the author thinks that ES6, rather than Coffeescript, is a more viable choice
of language; plugin-writers can always choose to opt-in to Coffeescript and
export a built file if they want.)

Additional thanks to the many, many Hubot script-writers that have provided a
large base of existing scripts and adapters which were converted to Exobot. The
original scripts' information has been preserved where scripts were converted
rather than re-built.

## License

MIT licensed. Copyright 2016 Exoplay, LLC. See LICENSE file for more details.
