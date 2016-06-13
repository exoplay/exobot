require("source-map-support").install();
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("node-uuid"),require("babel-polyfill"),require("eventemitter3"),require("cryptr"),require("discord.io"),require("events"),require("fs-extra"),require("lowdb"),require("readline"),require("tmi.js"),require("underscore-db"),require("util")):"function"==typeof define&&define.amd?define(["node-uuid","babel-polyfill","eventemitter3","cryptr","discord.io","events","fs-extra","lowdb","readline","tmi.js","underscore-db","util"],t):"object"==typeof exports?exports["exobot.js"]=t(require("node-uuid"),require("babel-polyfill"),require("eventemitter3"),require("cryptr"),require("discord.io"),require("events"),require("fs-extra"),require("lowdb"),require("readline"),require("tmi.js"),require("underscore-db"),require("util")):e["exobot.js"]=t(e["node-uuid"],e["babel-polyfill"],e.eventemitter3,e.cryptr,e["discord.io"],e.events,e["fs-extra"],e.lowdb,e.readline,e["tmi.js"],e["underscore-db"],e.util)}(this,function(e,t,n,r,o,i,a,u,c,s,f,l){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(t.s=19)}([function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=function i(e){var t=arguments.length<=1||void 0===arguments[1]?e:arguments[1];r(this,i),this.name=e,this.id=t};t.a=o},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=n(7),i=o&&o.__esModule?function(){return o["default"]}:function(){return o};Object.defineProperty(i,"a",{get:i});var a=n(5),u=n(6),c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(){function e(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];r(this,e),this.options=t,this.id=t.id||o.v4.call(),this.status=e.STATUS.UNINITIALIZED}return c(e,[{key:"register",value:function(t){if(!t)throw new Error("No bot passed to register; fatal.");this.bot=t,this.status=e.STATUS.CONNECTING,this.listen()}},{key:"listen",value:function(){if(!this.bot)throw new Error("No bot to listen on; fatal.");this.bot.emitter.on("send-message:"+this.id,this.send.bind(this))}},{key:"receive",value:function(e){var t=e.user,n=e.text,r=e.channel,o=e.whisper,i=new a.a({user:t,text:n,channel:r,whisper:o,adapter:this.id});this.bot.emitter.emit("receive-message",i)}},{key:"receiveWhisper",value:function(e){var t=e.user,n=e.text,r=e.channel;n=this.bot.prependNameForWhisper(n),this.receive({user:t,text:n,channel:r,whisper:!0})}},{key:"enter",value:function(e){var t=e.user,n=e.channel,r=new u.a({user:t,channel:n,adapter:this.id,type:u.a.TYPES.ENTER});this.bot.emitter.emit("enter",r)}},{key:"leave",value:function(e){var t=e.user,n=e.channel,r=new u.a({user:t,channel:n,adapter:this.id,type:u.a.TYPES.LEAVE});this.bot.emitter.emit("leave",r)}},{key:"send",value:function(e){console.log(e.text)}},{key:"ping",value:function(){this.pong()}},{key:"pong",value:function(){console.log("Ping received, this.pong() not implemented.")}}]),e}();s.STATUS={UNINITIALIZED:0,CONNECTING:1,CONNECTED:2,DISCONNECTED:3,RECONNECTING:4,ERROR:5},t.a=s},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(3),u=n(5),c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=/.+/,l=function(e){function t(){r(this,t);var e=o(this,Object.getPrototypeOf(t).call(this));return e.regexp=f,e.respondFunctions=[],e.listenFunctions=[],e}return i(t,e),s(t,[{key:"register",value:function(e){var t=this;this.bot=e,this.botNameRegex=new RegExp("^(?:(?:"+e.name+"|"+e.alias+")[,\\s:.-]*)(.+)"),e.emitter.on("receive-message",function(e){t.respondFunctions.forEach(function(n){return t.process(n[0],n[1],e,!0)}),t.listenFunctions.forEach(function(n){return t.process(n[0],n[1],e)})})}},{key:"process",value:function(e,t,n){var r=this,o=arguments.length<=3||void 0===arguments[3]?!1:arguments[3];if(o){var i=this.validateBotName(n);if(!i)return;n=new u.a(c({},n,{text:i,direct:!0}))}e.exec&&(e=this.validate(e));var a=e(n);if(a){var s=t(a,n);if(s)if(s instanceof Promise)s.then(function(e){var t=new u.a(c({},n,{text:e}));r.bot.emitter.emit("send-message:"+n.adapter,t)});else{var f=new u.a(c({},n,{text:s}));this.bot.emitter.emit("send-message:"+n.adapter,f)}}}},{key:"validate",value:function(e){return function(t){return e.exec(t.text)}}},{key:"validateBotName",value:function(e){var t=this.botNameRegex.exec(e.text);if(t)return t[1]}},{key:"respond",value:function(e,t){t&&(t=t.bind(this)),this.respondFunctions.push([e,t])}},{key:"listen",value:function(e,t){t&&(t=t.bind(this)),this.listenFunctions.push([e,t])}}]),t}(a.a);t.a=l},function(e,t,n){"use strict";function r(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(c){return void n(c)}return a.done?void e(u):Promise.resolve(u).then(function(e){return r("next",e)},function(e){return r("throw",e)})}return r("next")})}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=function(){function e(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];o(this,e),this.help=void 0,this._requiresDatabase=!1,this.options=t}return i(e,[{key:"register",value:function(e){if(!e)throw new Error("No bot passed to register; fatal.");this.bot=e}},{key:"listen",value:function(){if(!this.bot)throw new Error("No bot to listen on; fatal.")}},{key:"database",value:function(){function e(e,n){return t.apply(this,arguments)}var t=r(regeneratorRuntime.mark(function n(e,t){var r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,this.databaseInitialized();case 2:r=this.bot.db.get(e).value(),"undefined"==typeof r&&this.bot.db.set(e,t).value();case 4:case"end":return n.stop()}},n,this)}));return e}()},{key:"databaseInitialized",value:function(){function e(){return t.apply(this,arguments)}var t=r(regeneratorRuntime.mark(function n(){var e=this;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this._requiresDatabase=!0,!this._requiresDatabase||!this.bot.db){t.next=3;break}return t.abrupt("return",!0);case 3:return t.abrupt("return",new Promise(function(t){e.bot.emitter.on("dbLoaded",t)}));case 4:case"end":return t.stop()}},n,this)}));return e}()}]),e}();t.a=a},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=n(7),i=o&&o.__esModule?function(){return o["default"]}:function(){return o};Object.defineProperty(i,"a",{get:i});var a=function u(e){var t=e.user,n=e.channel,i=e.adapter,a=e.id,c=void 0===a?o.v4.call():a;r(this,u),this.user=t,this.channel=n,this.adapter=i,this.id=c};t.a=a},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(4),u=function(e){function t(e){var n=e.text,i=e.whisper,a=void 0===i?!1:i;r(this,t);var u=o(this,Object.getPrototypeOf(t).apply(this,arguments));return u.text=n,u.whisper=a,u}return i(t,e),t}(a.a);t.a=u},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(4),u=function(e){function t(e){var n=e.type;r(this,t);var i=o(this,Object.getPrototypeOf(t).apply(this,arguments));return i.type=n,i}return i(t,e),t}(a.a);u.TYPES={ENTER:0,LEAVE:1},t.a=u},function(e,t){e.exports=require("node-uuid")},function(e,t,n){"use strict";var r=n(1),o=n(16);Object.prototype.hasOwnProperty.call(r,"a")&&Object.defineProperty(t,"Adapter",{configurable:!1,enumerable:!0,get:function(){return r.a}});var i=o;Object.defineProperty(t,"adapters",{configurable:!1,enumerable:!0,get:function(){return i}})},function(e,t,n){"use strict";function r(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(c){return void n(c)}return a.done?void e(u):Promise.resolve(u).then(function(e){return r("next",e)},function(e){return r("throw",e)})}return r("next")})}}var o=n(26),i=o&&o.__esModule?function(){return o["default"]}:function(){return o};Object.defineProperty(i,"a",{get:i});var a=n(30),u=a&&a.__esModule?function(){return a["default"]}:function(){return a};Object.defineProperty(u,"a",{get:u});var c=n(29),s=c&&c.__esModule?function(){return c["default"]}:function(){return c};Object.defineProperty(s,"a",{get:s});var f=n(33),l=f&&f.__esModule?function(){return f["default"]}:function(){return f};Object.defineProperty(l,"a",{get:l});var p=function(e){return function(t){if(!t)return{};var n=e.decrypt(t),r=JSON.parse(n);return r}},h=function(e){return function(t){var n=JSON.stringify(t),r=e.encrypt(n);return r}},b=function(e){return function(t,n){return new Promise(function(r,o){e(t).then(function(e){try{r(n(e))}catch(t){o(t)}})})}},d=function(e){return function(t,n,r){return new Promise(function(o,i){try{var a=r(n);e(t,a).then(o,i)}catch(u){i(u)}})}},y=function(e){return new Promise(function(t,n){s.a.ensureFile(e,function(r){return r?n(r):void s.a.readFile(e,"utf8",function(e,r){return e?n(e):t(r)})})})},v=function(e,t){return new Promise(function(n,r){s.a.ensureFile(e,function(o){return o?r(o):void s.a.writeFile(e,t,"utf8",function(e){return e?r(e):n(t)})})})},g=function(){var e=r(regeneratorRuntime.mark(function t(e){var n,r,o,a=e.path,c=e.key,s=e.readFile,f=void 0===s?y:s,g=e.writeFile,w=void 0===g?v:g;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return n=new i.a(c||name),r=a||"./data/"+name+".json",e.next=4,new u.a(r,{storage:{read:b(f),write:d(w)},format:{deserialize:p(n),serialize:h(n)}});case 4:return o=e.sent,o._.mixin(l.a),e.abrupt("return",o);case 7:case"end":return e.stop()}},t,this)}));return function(t){return e.apply(this,arguments)}}();Object.defineProperty(t,"a",{configurable:!1,enumerable:!0,get:function(){return g}})},function(e,t,n){"use strict";var r=n(4),o=n(6),i=n(5);Object.prototype.hasOwnProperty.call(r,"a")&&Object.defineProperty(t,"Message",{configurable:!1,enumerable:!0,get:function(){return r.a}}),Object.prototype.hasOwnProperty.call(o,"a")&&Object.defineProperty(t,"PresenceMessage",{configurable:!1,enumerable:!0,get:function(){return o.a}}),Object.prototype.hasOwnProperty.call(i,"a")&&Object.defineProperty(t,"TextMessage",{configurable:!1,enumerable:!0,get:function(){return i.a}})},function(e,t,n){"use strict";var r=n(3),o=n(2),i=n(20),a=n(21),u=n(24);Object.prototype.hasOwnProperty.call(r,"a")&&Object.defineProperty(t,"Plugin",{configurable:!1,enumerable:!0,get:function(){return r.a}}),Object.prototype.hasOwnProperty.call(o,"a")&&Object.defineProperty(t,"ChatPlugin",{configurable:!1,enumerable:!0,get:function(){return o.a}}),Object.prototype.hasOwnProperty.call(i,"a")&&Object.defineProperty(t,"EventPlugin",{configurable:!1,enumerable:!0,get:function(){return i.a}}),Object.prototype.hasOwnProperty.call(a,"a")&&Object.defineProperty(t,"HTTPPlugin",{configurable:!1,enumerable:!0,get:function(){return a.a}});var c=u;Object.defineProperty(t,"plugins",{configurable:!1,enumerable:!0,get:function(){return c}})},function(e,t,n){var r=n(34).format,o=n(28).EventEmitter,i=t=e.exports=function(e,n){"string"==typeof e&&(e=t[e.toUpperCase()]),this.level=e||t.DEBUG,this.stream=n||process.stdout,this.stream.readable&&this.read()};t.EMERGENCY=0,t.ALERT=1,t.CRITICAL=2,t.ERROR=3,t.WARNING=4,t.NOTICE=5,t.INFO=6,t.DEBUG=7,i.prototype={read:function(){var e="",n=this,r=this.stream;r.setEncoding("utf8"),r.on("data",function(r){e+=r,"\n"==e[e.length-1]&&(e.split("\n").map(function(e){if(e.length)try{var r=e.match(/^\[([^\]]+)\] (\w+) (.*)/),o={date:new Date(r[1]),level:t[r[2]],levelString:r[2],msg:r[3]};n.emit("line",o)}catch(i){}}),e="")}),r.on("end",function(){n.emit("end")})},log:function(e,n){if(t[e]<=this.level){var o=r.apply(null,n);this.stream.write("["+new Date+"] "+e+" "+o+"\n")}},emergency:function(e){this.log("EMERGENCY",arguments)},alert:function(e){this.log("ALERT",arguments)},critical:function(e){this.log("CRITICAL",arguments)},error:function(e){this.log("ERROR",arguments)},warning:function(e){this.log("WARNING",arguments)},notice:function(e){this.log("NOTICE",arguments)},info:function(e){this.log("INFO",arguments)},debug:function(e){this.log("DEBUG",arguments)}},i.prototype.__proto__=o.prototype},function(e,t){e.exports=require("babel-polyfill")},function(e,t){e.exports=require("eventemitter3")},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(1),u=n(0),c=n(27),s=c&&c.__esModule?function(){return c["default"]}:function(){return c};Object.defineProperty(s,"a",{get:s});var f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=function b(e,t,n){null===e&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var o=Object.getPrototypeOf(e);return null===o?void 0:b(o,t,n)}if("value"in r)return r.value;var i=r.get;if(void 0!==i)return i.call(n)},p={ready:"discordReady",message:"discordMessage",presence:"discordPresence",disconnected:"discordDisconnected"},h=function(e){function t(e){var n=e.token,i=e.botId,u=e.username;r(this,t);var c=o(this,Object.getPrototypeOf(t).apply(this,arguments));return c.channels={},c.discordDisconnected=function(){c.status=a.a.STATUSES.DISCONNECTED,c.bot.log.critical("Disconnected from Discord.")},c.botId=i,c.username=u,c.token=n,c}return i(t,e),f(t,[{key:"register",value:function(e){var n=this;l(Object.getPrototypeOf(t.prototype),"register",this).apply(this,arguments);var r=this.token,o=this.botId,i=this.username;return r&&o&&i?(this.client=new s.a.Client({token:r,autorun:!0}),void Object.keys(p).forEach(function(e){var t=n[p[e]];n.client.on(e,function(){return t.apply(void 0,arguments)}),n.client.on(e,function(){for(var t,r=arguments.length,o=Array(r),i=0;r>i;i++)o[i]=arguments[i];(t=n.bot.emitter).emit.apply(t,["discord-"+e].concat(o))})})):(this.status=a.a.STATUSES.ERROR,void e.log.error("token, botId, and username are required to connect to discord."))}},{key:"send",value:function(e){this.bot.log.debug("Sending "+e.text+" to "+e.channel),this.client.sendMessage({to:e.channel,message:e.text})}},{key:"discordReady",value:function(){this.status=a.a.STATUSES.CONNECTED,this.bot.emitter.emit("connected",this.id),this.bot.log.notice("Connected to Discord."),this.client.setPresence({game:"Exobotting"})}},{key:"discordMessage",value:function(e,n,r,o){if(e!==this.username){var i=new u.a(e,n);return this.client.directMessages[r]?l(Object.getPrototypeOf(t.prototype),"receiveWhisper",this).call(this,{user:i,text:o,channel:r}):void this.receive({user:i,text:o,channel:r})}}},{key:"discordPresence",value:function(e,n,r,o,i){if(n!==this.botId){var a=new u.a(e,n);if("online"===r)return l(Object.getPrototypeOf(t.prototype),"enter",this).call(this,{user:a,channel:i.d.channel_id});if("offline"===r)return l(Object.getPrototypeOf(t.prototype),"leave",this).call(this,{user:a,channel:i.d.channel_id})}}}]),t}(a.a);t.a=h},function(e,t,n){"use strict";var r=n(17),o=n(15),i=n(18);Object.prototype.hasOwnProperty.call(r,"a")&&Object.defineProperty(t,"Shell",{configurable:!1,enumerable:!0,get:function(){return r.a}}),Object.prototype.hasOwnProperty.call(o,"a")&&Object.defineProperty(t,"Discord",{configurable:!1,enumerable:!0,get:function(){return o.a}}),Object.prototype.hasOwnProperty.call(i,"a")&&Object.defineProperty(t,"Twitch",{configurable:!1,enumerable:!0,get:function(){return i.a}})},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(31),u=a&&a.__esModule?function(){return a["default"]}:function(){return a};Object.defineProperty(u,"a",{get:u});var c=n(1),s=n(0),f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=function d(e,t,n){null===e&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var o=Object.getPrototypeOf(e);return null===o?void 0:d(o,t,n)}if("value"in r)return r.value;var i=r.get;if(void 0!==i)return i.call(n)},p="SHELL",h=new s.a("shell"),b=function(e){function t(){r(this,t);var e=o(this,Object.getPrototypeOf(t).call(this));return e.rl=u.a.createInterface({input:process.stdin,output:process.stdout}),e}return i(t,e),f(t,[{key:"prompt",value:function(){var e=this;this.rl.question("Chat: ",function(n){l(Object.getPrototypeOf(t.prototype),"receive",e).call(e,{text:n,channel:p,user:h}),e.prompt()})}},{key:"register",value:function(e){l(Object.getPrototypeOf(t.prototype),"register",this).call(this,e),this.prompt(),this.status=c.a.STATUS.CONNECTED}}]),t}(c.a);t.a=b},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(1),u=n(0),c=n(32),s=c&&c.__esModule?function(){return c["default"]}:function(){return c};Object.defineProperty(s,"a",{get:s});var f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=function d(e,t,n){null===e&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var o=Object.getPrototypeOf(e);return null===o?void 0:d(o,t,n)}if("value"in r)return r.value;var i=r.get;if(void 0!==i)return i.call(n)},p={connecting:"twitchConnecting",connected:"twitchConnected",logon:"twitchLogon",disconnected:"twitchDisconnected",reconnect:"twitchReconnect",chat:"twitchChat",emoteonly:"twitchEmoteonly",join:"twitchJoin",part:"twitchPart",mods:"twitchMods",notice:"twitchNotice",ping:"twitchPing",pong:"twitchPong",roomstate:"twitchRoomstate",slowmode:"twitchSlowmode",subscribers:"twitchSubscribers",subscription:"twitchSubscription",timeout:"twitchTimeout",whisper:"twitchWhisper"},h=function(e){function t(e){var n=e.username,i=e.oauthPassword,a=e.channels,u=void 0===a?[]:a;r(this,t);var c=o(this,Object.getPrototypeOf(t).apply(this,arguments));return b.call(c),c.username=n,c.oauthPassword=i,c.channels=u,c}return i(t,e),f(t,[{key:"register",value:function(e){var n=this;l(Object.getPrototypeOf(t.prototype),"register",this).apply(this,arguments);var r=this.username,o=this.oauthPassword,i=this.channels;return r&&o?(i.length||e.log.critical("No channels passed to Twitch adapter to connect to."),this.client=new s.a.client({channels:i,identity:{username:r,password:o},options:{debug:!0},secure:!0,reconnect:!0,logger:{info:e.log.info.bind(e.log),warn:e.log.warning.bind(e.log),error:e.log.error.bind(e.log)},connection:{cluster:"aws"}}),this.client.connect(),void Object.keys(p).forEach(function(e){var t=n[p[e]];n.client.on(e,function(){return t.apply(void 0,arguments)}),n.client.on(e,function(){for(var t,r=arguments.length,o=Array(r),i=0;r>i;i++)o[i]=arguments[i];(t=n.bot.emitter).emit.apply(t,["twitch-"+e].concat(o))})})):void e.log.error("username and oauthPassword are required to connect to Twitch.")}},{key:"send",value:function(e){return this.bot.log.debug("Sending "+e.text+" to "+e.channel),e.whisper?this.client.whisper(e.user.name,e.text):void this.client.say(e.channel,e.text)}}]),t}(a.a),b=function(){var e=this;this.twitchConnecting=function(){e.status=a.a.STATUS.CONNECTING},this.twitchConnected=function(){e.status=a.a.STATUS.CONNECTED,e.bot.emitter.emit("connected",e.id),e.bot.log.notice("Connected to Twitch.")},this.twitchLogon=function(){e.status=a.a.STATUS.CONNECTED,e.bot.log.notice("Successfully logged on to Twitch.")},this.twitchDisconnected=function(){e.status=a.a.STATUS.DISCONNECTED,e.bot.log.warning("Disconnected from Twitch.")},this.twitchReconnect=function(){e.status=a.a.STATUS.RECONNECTING,e.bot.log.notice("Reconnecting to Twitch.")},this.twitchChat=function(t,n,r){if(n.username!==e.username){var o=new u.a(n.username);e.receive({user:o,text:r,channel:t})}},this.twitchEmoteonly=function(){},this.twitchJoin=function(t,n){if(n===e.username){var r=new u.a(n);return e.enter({user:r,channel:t})}},this.twitchPart=function(t,n){if(n===e.username){var r=new u.a(n);return e.leave({user:r,channel:t})}},this.twitchPing=function(){e.ping()},this.twitchWhisper=function(t,n){if(t.username!==e.username){var r=new u.a(t.username);e.receiveWhisper({user:r,text:n,channel:t.username})}},this.twitchPong=function(){},this.twitchRoomstate=function(){},this.twitchSlowmode=function(){},this.twitchSubscribers=function(){},this.twitchSubscription=function(){},this.twitchTimeout=function(){},this.twitchMods=function(){},this.twitchNotice=function(){}};t.a=h},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var o=n(13),i=o&&o.__esModule?function(){return o["default"]}:function(){return o};Object.defineProperty(i,"a",{get:i});var a=n(14),u=a&&a.__esModule?function(){return a["default"]}:function(){return a};Object.defineProperty(u,"a",{get:u});var c=n(12),s=c&&c.__esModule?function(){return c["default"]}:function(){return c};Object.defineProperty(s,"a",{get:s});var f=n(9),l=n(8),p=n(10),h=n(11),b=n(0);for(var d in l)["Exobot","User","default"].indexOf(d)<0&&function(e){Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:function(){return l[e]}})}(d);for(var d in p)["Exobot","User","default"].indexOf(d)<0&&function(e){Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:function(){return p[e]}})}(d);for(var d in h)["Exobot","User","default"].indexOf(d)<0&&function(e){Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:function(){return h[e]}})}(d);Object.prototype.hasOwnProperty.call(b,"a")&&Object.defineProperty(t,"User",{configurable:!1,enumerable:!0,get:function(){return b.a}});var y=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),v=function(){function e(t){var n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];r(this,e),g.call(this),this.name=t,this.alias=n.alias,this.emitter=new u.a,this.initLog(n.logLevel||s.a.WARNING),this.initAdapters(n.adapters),this.initPlugins(n.plugins);var o=n.dbPath||"./data/"+t+".json";this.initDB(n.key,o,n.readFile,n.writeFile)}return y(e,[{key:"addPlugin",value:function(e){e.register(this),this.plugins.push(e)}},{key:"addAdapter",value:function(e){e.register(this),this.adapters[e.id]=e}},{key:"prependNameForWhisper",value:function(e){return e.slice(0,this.name.length).toLowerCase()!==this.name.toLowerCase()&&e.slice(0,this.alias.length).toLowerCase()!==this.alias.toLowerCase()&&(e=this.name+" "+e),e}}]),e}();Object.defineProperty(t,"Exobot",{configurable:!1,enumerable:!0,get:function(){return v}});var g=function(){var e=this;this.plugins=[],this.adapters={},this.initAdapters=function(){var t=arguments.length<=0||void 0===arguments[0]?[]:arguments[0];t.forEach(function(t){return e.addAdapter(t)})},this.initPlugins=function(){var t=arguments.length<=0||void 0===arguments[0]?[]:arguments[0];t.forEach(function(t){return e.addPlugin(t)})},this.initLog=function(t){var n=new s.a(t||s.a.WARNING);e.log=n,t===s.a.DEBUG&&setInterval(e.logProcess,1e4)},this.initDB=function(t,n,r,o){return t?void f.a.call(void 0,{key:t,readFile:r,writeFile:o,path:n,emitter:e.emitter}).then(function(t){e.db=t,e.emitter.emit("dbLoaded",t)}):void e.log.critical("Pass options.key in to bot initializer. Database not initializing.")},this.logProcess=function(){e.log.debug(process.memoryUsage(),process.cpuUsage())}}},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(3),u=function(e){function t(){return r(this,t),o(this,Object.getPrototypeOf(t).apply(this,arguments))}return i(t,e),t}(a.a);t.a=u},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(3),u=function(e){function t(){return r(this,t),o(this,Object.getPrototypeOf(t).apply(this,arguments))}return i(t,e),t}(a.a);t.a=u},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(2),u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=function h(e,t,n){null===e&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var o=Object.getPrototypeOf(e);return null===o?void 0:h(o,t,n)}if("value"in r)return r.value;var i=r.get;if(void 0!==i)return i.call(n)},s=["hi","hello","sup","greetings","yo","hey"],f=["goodbye","farwell","bye","later","see ya","cya"],l=function(e,t){return new RegExp("^("+t.join("|")+")[,\\s]*"+e,"i")},p=function(e){function t(){var e,n,i,a;r(this,t);for(var u=arguments.length,c=Array(u),s=0;u>s;s++)c[s]=arguments[s];return n=i=o(this,(e=Object.getPrototypeOf(t)).call.apply(e,[this].concat(c))),i.help='Greetings: says "hi" back. Say "hi <botname>" for a response.',a=n,o(i,a)}return i(t,e),u(t,[{key:"register",value:function(e){c(Object.getPrototypeOf(t.prototype),"register",this).apply(this,arguments),this.listen(l(e.name,s),this.greeting),this.listen(function(e){return s.includes(e.text.toLowerCase())},this.greeting),this.respond(function(e){return s.includes(e.text.toLowerCase())},this.greeting),this.listen(l(e.name,f),this.farewell),this.listen(function(e){return f.includes(e.text.toLowerCase())},this.farewell),this.respond(function(e){return f.includes(e.text.toLowerCase())},this.farewell)}},{key:"greeting",value:function(e,t){var n=s[parseInt(Math.random()*s.length)];return n+", "+t.user.name+"!"}},{key:"farewell",value:function(e,t){var n=f[parseInt(Math.random()*f.length)];return n+", "+t.user.name+"!"}}]),t}(a.a);t.a=p},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{
constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var a=n(2),u=function(e){function t(){r(this,t);var e=o(this,Object.getPrototypeOf(t).apply(this,arguments));return e.help='Help: Explains commands. Say "<botname> help" for information.',e.pluginHelp=function(){return e.bot.plugins.filter(function(e){return e.help}).map(function(e){return e.help},[]).join("\n")},e.respond(/^help$/,e.pluginHelp),e}return i(t,e),t}(a.a);t.a=u},function(e,t,n){"use strict";var r=n(22),o=n(23),i=n(25),a=n(35);Object.prototype.hasOwnProperty.call(r,"a")&&Object.defineProperty(t,"Greetings",{configurable:!1,enumerable:!0,get:function(){return r.a}}),Object.prototype.hasOwnProperty.call(o,"a")&&Object.defineProperty(t,"Help",{configurable:!1,enumerable:!0,get:function(){return o.a}}),Object.prototype.hasOwnProperty.call(i,"a")&&Object.defineProperty(t,"Points",{configurable:!1,enumerable:!0,get:function(){return i.a}}),Object.prototype.hasOwnProperty.call(a,"a")&&Object.defineProperty(t,"DBDump",{configurable:!1,enumerable:!0,get:function(){return a.a}})},function(e,t,n){"use strict";function r(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(c){return void n(c)}return a.done?void e(u):Promise.resolve(u).then(function(e){return r("next",e)},function(e){return r("throw",e)})}return r("next")})}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var u=n(2),c=function(){function e(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(c){o=!0,i=c}finally{try{!r&&u["return"]&&u["return"]()}finally{if(o)throw i}}return n}return function(t,n){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),s=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),f=function h(e,t,n){null===e&&(e=Function.prototype);var r=Object.getOwnPropertyDescriptor(e,t);if(void 0===r){var o=Object.getPrototypeOf(e);return null===o?void 0:h(o,t,n)}if("value"in r)return r.value;var i=r.get;if(void 0!==i)return i.call(n)},l=function(e){return e.replace(/[^\w]/g,"")},p=function(e){function t(){o(this,t);var e=i(this,Object.getPrototypeOf(t).apply(this,arguments));return e.help=["Points: add points to things. `thing++` or `thing--` adds or removes","points. Users are rate-limited from voting on the same thing multiple","times. Optionally add reasons: `thing++ for my reasons`."].join(" "),e.listen(/^([\s\w'@.\-:]*)\s*\+\+$/,e.addPoints),e}return a(t,e),s(t,[{key:"register",value:function(e){f(Object.getPrototypeOf(t.prototype),"register",this).call(this,e),this.database("points",[])}},{key:"addPoints",value:function(){function e(e){return t.apply(this,arguments)}var t=r(regeneratorRuntime.mark(function n(e){var t,r,o=c(e,2),i=(o[0],o[1]);return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return i=i.trim(),t=l(i),e.next=4,this.databaseInitialized();case 4:return r=this.bot.db.get("points").find({id:t}).value()||this.buildPoints(i,t),r.points++,this.bot.db.get("points").insert(r).value(),console.log(this.bot.db.get("points").value()),e.abrupt("return",i+" has "+r.points+" points.");case 9:case"end":return e.stop()}},n,this)}));return e}()},{key:"buildPoints",value:function(e,t){return{name:e,id:t,points:0,reasons:[]}}}]),t}(u.a);t.a=p},function(e,t){e.exports=require("cryptr")},function(e,t){e.exports=require("discord.io")},function(e,t){e.exports=require("events")},function(e,t){e.exports=require("fs-extra")},function(e,t){e.exports=require("lowdb")},function(e,t){e.exports=require("readline")},function(e,t){e.exports=require("tmi.js")},function(e,t){e.exports=require("underscore-db")},function(e,t){e.exports=require("util")},function(e,t,n){"use strict";function r(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(o,i){try{var a=t[o](i),u=a.value}catch(c){return void n(c)}return a.done?void e(u):Promise.resolve(u).then(function(e){return r("next",e)},function(e){return r("throw",e)})}return r("next")})}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var u=n(2),c=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=function(e){function t(){o(this,t);var e=i(this,Object.getPrototypeOf(t).apply(this,arguments));return e.help='dbdump: dump the database. Say "<botname> dbdump".',e.respond(/^db dump/,e.dump),e.respond(/^db clear/,e.clear),e}return a(t,e),c(t,[{key:"dump",value:function(){function e(){return t.apply(this,arguments)}var t=r(regeneratorRuntime.mark(function n(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.databaseInitialized();case 2:return e.abrupt("return",this.bot.db.getState());case 3:case"end":return e.stop()}},n,this)}));return e}()},{key:"clear",value:function(){function e(){return t.apply(this,arguments)}var t=r(regeneratorRuntime.mark(function n(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.databaseInitialized();case 2:this.bot.log.critical("Database clearing."),this.bot.db.setState(),this.bot.initializePlugins();case 5:case"end":return e.stop()}},n,this)}));return e}()}]),t}(u.a);t.a=s}])});
//# sourceMappingURL=exobot.js.map