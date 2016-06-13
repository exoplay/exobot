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
  }

  register (bot) {
    super.register(bot);
    this.database('points', []);
  }

  async addPoints ([match, name]) {
    name = name.trim();
    const id = nameToId(name);

    await this.databaseInitialized();

    const points = this.bot.db.get('points')
                              .find({ id })
                              .value() || this.buildPoints(name, id);

    points.points++;

    this.bot.db.get('points')
               .insert(points)
               .value();

    console.log(this.bot.db.get('points').value());


    return `${name} has ${points.points} points.`;
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
