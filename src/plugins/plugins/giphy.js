import ChatPlugin from '../chat';

export const ENDPOINT = 'http://api.giphy.com/v1/gifs/search';

export default class GiphyPlugin extends ChatPlugin {
  help = 'Help: Explains commands. Say "<botname> help" for information.';

  constructor (options={}) {
    const { apiKey } = options;
    super(...arguments);
    this.respond(/^(?:gif|giphy)(?:\sme)?\s+(.*)/i, this.giphy);

    this.apiKey = apiKey;
  }

  register (bot) {
    super.register(...arguments);

    if (!this.apiKey) {
      bot.log.critical('No apiKey passed to Giphy plugin; plugin will not work.');
    }
  }

  async giphy ([, search]) {
    try {
      const { body } = await this.bot.http.get(ENDPOINT)
                     .query({ q: search, api_key: this.apiKey });

      const { data } = body;

      if (data.length) {
        return data[parseInt(Math.random() * data.length)].images.original.url;
      }
    } catch (e) {
      this.bot.log.notice('Error returned from Giphy request.');
      this.bot.log.debug(e);
    }
  }
}
