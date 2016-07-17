# Exobot

An ES6+ chatbot. Requires Node ^6.2.

## Installation

* `npm install --save @exoplay/exobot`

## A Brief Example

```javascript
const { Exobot, adapters, plugins } = require('@exoplay/exobot');
const { Help, Greetings } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || Exobot.LogLevels.INFO;

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
  plugins
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

## License

MIT licensed. Copyright 2016 Exoplay, LLC. See LICENSE file for more details.
