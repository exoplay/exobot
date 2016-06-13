import ChatPlugin from '../chat';

export const nameToId = (name) => {
  return name.replace(/[^\w]/g, '');
}

export default class HelpPlugin extends ChatPlugin {
  help = [
    'Points: add points to things. `thing++` or `thing--` adds or removes',
    'points. Users are rate-limited from voting on the same thing multiple',
    'times. Optionally add reasons: `thing++ for my reasons`.',
  ].join(' ');

  constructor () {
    super(...arguments);

    this.listen(/^([\s\w'@.\-:]*)\s*\+\+$/, this.addPoints);
    this.respond(/^tops$/, this.tops);
  }

  register (bot) {
    super.register(bot);
    this.database('points', { things: {}, tops: [] });
  }

  async addPoints ([match, name]) {
    name = name.trim();
    const id = nameToId(name);

    await this.databaseInitialized();

    let points = this.bot.db.get(`points.things.${id}`).value();

    if (!points) { points = this.buildPoints(name, id); }

    points.points++;

    this.bot.db.set(`points.things.${id}`, points).value();
    this.bot.db.write();

    this.updateTops();

    return `${name} has ${points.points} points.`;
  }

  async tops () {
    await this.databaseInitialized();

    try {
    const scores = this.bot.db.get('points.things').value();
    const tops = this.bot.db.get('points.tops').slice(0,10).value();

    return tops.map(t => `${scores[t].name}: ${scores[t].points}`).join('\n');
    } catch (e) { console.log(e); }
  }

  async updateTops() {
    await this.databaseInitialized();

    const tops = this.bot.db.get(`points.things`)
                             .orderBy('points', 'desc')
                             .map('id')
                             .value();

    this.bot.db.set('points.tops', tops).value();
    this.bot.db.write();
  }

  buildPoints (name, id) {
    return {
      name,
      id,
      points: 0,
      reasons: [],
    };
  }
}
