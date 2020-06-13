import { Plugin } from '../plugin';

export default class Node extends Plugin {
  static type = 'node';

  static propTypes = {};

  constructor(options, bot, log) {
    super(options, bot, log);

    process.on('SIGTERM', () => {
      this.bot.log.warning('SIGTERM received');
      this.bot.shutdown().then(
        () => process.exit(0),
        (e) => { this.bot.log.error(e); process.exit(1); },
      );
    });
  }
}
