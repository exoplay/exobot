# Exobot

An ES6+ chatbot. Requires Node ^6.2.



## Installation

* `npm install --save @exoplay/exobot`


## A Brief Example

To start an exobot instance, you need to import the bot itself and initialize it
with plugins and chat service adapters.

Write a file at, say, `./src/exobot.js` Like the below example:

```javascript
import { Exobot, adapters, plugins, LogLevels } from '@exoplay/exobot';
const { Help, Greetings } = plugins;

const BOT_ALIAS = '!e';
const BOT_NAME = 'exobot';
const LOG_LEVEL = process.env.EXOBOT_LOG_LEVEL || LogLevels.INFO;

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

Then, edit your `package.json` to point `main` at `exobot.js` (or whatever your
main file is called), like:

```
{
  //...
  "main": "exobot.js"
}
```

So that the build can find it. Then, build and run it!

```
$ exobot-build
$ node exobot.js
> Chat: hi, exobot
> exobot: hi, shell!
```


What did we do there?

* Created a file named `./src/exobot.js`
* Imported the `Exobot` class, service adapters, and plugins
* Initialized a new bot, passing in its name, configured service adapters and
  plugins
* Built the bot to turn ES7+ into node-compatible ES6
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
4. Add [npm scripts](https://docs.npmjs.com/misc/scripts)
  such as `"build": "exobot-build"` and `"watch": "exobot-build --watch"` to
  your package.json to get access to the bot building commands
4. Copy the example above to `./src/exobot.js`.
5. Build the bot with `npm run build`
5. Run `node exobot.js`. Chat with yourself for a while, then read on to learn
  how to configure your chatbot, or even build your own plugins and adapters.


## Configuration

Exobot is configured in its constructor, which takes two arguments - a bot
name (a required string), and an options object.

The bot name is used for commands - if your bot's name is `'exobot'`, it will
`respond` to commands beginning with `'exobot'`. You'll want this to match the
name used in your chat service (so if its name is actually `'DEATHBOT_9000'` in
Slack, you should call it that here too, or people may be confused.) 

The options object contains all other configuration - such as a list of
plugins and chat service adapters, log levels, and data encryption keys.

* `alias` - an additional way to trigger exobot commands. `'/'`, `';'`, or
  `'hey bot'`, for example.
* `adapters` - an array of initialized chat adapters, such as
  [slack](https://github.com/exoplay/exobot-adapter-slack),
  [discord](https://github.com/exoplay/exobot-adapter-discord),
  or [twitch](https://github.com/exoplay/exobot-adapter-twitch). exobot
  also comes with a `shell` adapter for playing around in your terminal.
* `plugins` - an array of initialized plugins, such as 
  [giphy](https://github.com/exoplay/exobot-plugin-giphy) or
  [points](https://github.com/exoplay/exobot-plugin-points). exobot also
  comes with `help` and `greetings` plugins as examples.
* `readFile` and `writeFile` - functions called when the in-memory json db
  is saved. By default, this writes a json file to `cwd/data/botname.json`,
  but you could also override the default local file storage to use s3 with
  [exobot-db-s3](https://github.com/exoplay/exobot-db-s3).
* `dbPath` - if you're using local file storage, you can set where to save.
  Defaults to `cwd/data/botname.json`.



## Building plugins

Most plugins respond to chat messages - either by `listen`ing to _all_ chat
messages, or `respond`ing to specific commands. exobot comes with `greetings`
and `help` plugins, but building your own is easy. Some examples:

* [giphy, for gif search](https://github.com/exoplay/exobot-plugin-giphy)
* [points, for fun](https://github.com/exoplay/exobot-plugin-points)

The [ES2017 decorators proposal](https://github.com/wycats/javascript-decorators)
is used to hook commands to validation functions or regexes, to assign permission
groups, and to provide help text.

### An Example Plugin

```javascript
import { ChatPlugin, respond, help, permissionGroup } from '@exoplay/exobot';

export default class Ping extends ChatPlugin {
  static name = 'ping';

  @help('Says "pong" when you send it "ping"');
  @permissionGroup('ping');
  @respond(/^ping$/);
  pong (match, message) {
    return 'pong';
  }
}
```

In this plugin, we have extended exobot's ChatPlugin class - this gives it
functionality to respond to chat messages. We've then told it to `respond` to
the regex `/ping/` by firing a function, called `pong`. The `return` value of
the function is then sent back to the chat channel.

### A Detailed Anatomy of a Chat Plugin

Chat plugins follow the following lifecycle:

First, The `constructor` is called with options sent in. As the bot is
initialized with _instances_ of plugins, this is where you would pass in
configuration options, such as:

```javascript
import { ChatPlugin, respond, help, permissionGroup } from '@exoplay/exobot';

class StatusPlugin extends ChatPlugin {
  constructor (options) {
    super(options);
    this.endpoint = options.endpoint;
  }

  //...

  @help('Gets the status of the configured endpoint.');
  @permissionGroup('get');
  @respond(m => m.text === 'status');
  async getStatus () {
    const res = await this.http.get(this.endpoint);
    return res.statusCode;
  }
}
```

In the above example, we'd initialize the exobot instance with
`plugins: [ new StatsPlugin({ endpoint: 'https://github.com' }) ]` to pass
in the options we need later on.

Next, when the bot instance begins listening, the plugin's `register` method is
called, with the `bot` instace passed in. Note that the constructor doesn't have
the bot yet - it doesn't exist until `register`, fired next.

You'll want to give the plugin a `static` `name` property - thi is used if you
use the permissions plugin to restrict access to commands.

`listen` and `respond` are decorators that take a function, and fire the method
when a match is found. `listen`
and `respond` are the most important parts of your chat plugin - these allow the
bot to interact with chat. Each can take either a regex _or_ a function, and if
a match is found (or, if a function, if it is truthy), it will fire the
function passed in. Functions for responding can be promises (or
ES7 `async` functions) and will resolve when the promises do. This makes it
easy to write asynchronous code, such as firing http requests.

The responding function gets two arguments: a `match` object, which is either
the regex's `exec` response or the function return value, and a `Message`
object, which contains the original message, user, and whether the message is a
whisper.

You can optionally add a `help` decorator, which exobot's `help` plugin uses to
explain to useres how the plugin works.

You should also add a `permissionsGroup`, which you can then use with
exobot's `Permissions` plugin to restrict access to certain commands. In the
following case, you can give access to `status.get` to groups, and if you deny
access by default in configuration, only users in the group with access to
`status.get` can use the command. (The bot will ignore the command from
everyone else.)

Finally, the bot also exposes `bot.http`, which is a promise-ified
[superagent](https://visionmedia.github.io/superagent/) wrapper, to make http
calls easy to make.

```javascript
import { ChatPlugin, respond, listen, permissionsGroup, help } from '@exoplay/exobot';

class StatusPlugin extends ChatPlugin {
  static name = 'Status';

  help = [
    'Get the status of an http endpoint. Responds to `status` or listens to',
    'status <http://whatever.com>.'
  ].join('\n');

  constructor (options) {
    super(options);
    this.endpoint = options.endpoint;
  }

  register (bot) {
    super.register(bot);

    if (!this.endpoint) {
      bot.log.warn('No endpoint passed in to StatusPlugin.');
    }

    this.respond(/status/, this.getStatus);
    this.listen(/^status (http:\/\/\S+)/, this.getStatus);
    this.listen(m => m.text === 'status', this.getStatus);
  }


  @help('use status or status <http> to get http status codes.');
  @permissionsGroup('get');
  @respond(/^status$/);
  @listen(/^status (http:\/\/\S+)/);
  @listen(m => m.text === 'status');
  async getStatus (match, message) {
    let endpoint = this.endpoint;

    // if the regex succeeded, match[1] should be an http endpoint
    if (match && match.length) {
      endpoint = match[1];
    }

    const res = await this.http.get(this.endpoint);
    return res.statusCode;
  }
}
```

You can also build other types of plugins: `EventPlugin`, `HTTPPlugin`, or build
your own class of plugin with the `Plugin` class. Documentation to come someday.



## Building Adapters

Adapters allow your bot to connect to a chat service, such as Slack or Discord.
exobot comes with a shell adapter by default, but you could also build your own
for your chat service of choice. Some examples:

* [slack](https://github.com/exoplay/exobot-adapter-slack)
* [discord](https://github.com/exoplay/exobot-adapter-discord)
* [twitch](https://github.com/exoplay/exobot-adapter-twitch)

### An Example Adapter

```javascript
// An example: import an API lib for your chat service, or do it with raw
// sockets or http, or whatever.
import ChatServiceLibrary from '@chatservice/lib';
import { Adapter, User } from '@exoplay/exobot';

export default class ChatServiceAdapter extends Adapter {
  constructor ({ token, username }) {
    super(...arguments);
    this.token = token;
    this.username = username;
  }

  register (bot) {
    super.register(bot);
    // Initialize the chat service lib we pulled in earlier
    this.service = new ChatServiceLibrary(this.username, this.token);

    // listen to some events. bind the functions to `this` to make sure we can
    // access our class instance, bot, and `super`.
    this.service.on('ready', this.serviceReady.bind(this));
    this.service.on('message', this.serviceMessage.bind(this));
  }

  // the `send` funciton is defined by Adapter and called by plugins when they
  // resolve (if they resolve.)
  send (message) {
    this.bot.log.debug(`Sending ${message.text} to ${message.channel}`);

    // Send the message data to the chat service client.
    this.service.sendMessage({
      to: message.channel,
      message: message.text,
    });
  }

  serviceReady () {
    this.status = Adapter.STATUS.CONNECTED;
    this.bot.emitter.emit('connected', this.id);
    this.bot.log.notice('Connected to ChatService.');
  }

  // We'll pretend our fake chat service lib takes a function which is called
  // with message, user, and channel. We'll take these arguments and "receive"
  // them, which will fire off all of the plugins so they can respond where
  // necessary.
  serviceMessage (user, text, channel) {
    // We don't want to listen to messages from ourself.
    if (user.name === this.username) { return; }

    // Create a new User instance to pass along in the Message.
    const user = new User(user.name, user.id);

    // Check if our fake chat service lib says the channel is "private". If it
    // is a private message between the user and bot, we'll make it act like a
    // "respond" command instead of just a "listen".
    if (channel.private) {
      return super.receiveWhisper({ user, text, channel });
    }

    return this.receive({ user, text, channel });
  }

  // This is useful for chat services where names aren't unique, for use by
  // plugins where uniqueness matters (like Permissions.)
  getUserIdByUserName (name) {
    return this.service.getUserByName(name).id;
  }
}

```

### A Detailed Anatomy of a Chat Service Adapter

Chat service adapters have a similar lifecycle to plugins:

1. Constructor, before the bot is initialized;
2. Register, when the bot is initialized, where you first get acccess to the
  exobot instance, and where you listen to your chat service;
3. Functions called by events fired by the chat service;
4. Finally, `send`, called by the bot instance when plugins resolve.

You can listen and fire any arbitrary functions - for example, some chat
services may include presence information, and fire `enter` and `leave` events.
You can then `receive` your own `PresenceMessage` similar to how we `receive` a
`TextMessage` in the `serviceMessage` in the example. (Right now, the only
`Message` classes are `TextMessage` and `PresenceMessage`). Many adapters may
also want to make use of the `Status` enum, which could be:

* UNINITIALIZED
* CONNECTING
* CONNECTED
* DISCONNECTED
* RECONNECTING
* ERROR

You may also want to use `bot.log` to log important events to stdout, such as
connection or configuration errors. `bot.log` can fire:

* debug
* info
* notice
* warning
* error
* critical
* alert
* emergency

In order of ascending severity.


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

LGPL licensed. Copyright 2016 Exoplay, LLC. See LICENSE file for more details.
