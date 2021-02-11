const WebScraper = require("./WebScraper.js");
const cheerio = require("cheerio");

class Dota2GamepediaAPI {
  constructor() {
    this.baseURL = "https://dota2.gamepedia.com"
    this.webScraper = new WebScraper(this.baseURL);
  }

  async getHeroes() {
    const tableOfHeroAttributesPage = await this.webScraper.scrape("Table_of_hero_attributes");
    const $parse = cheerio.load(tableOfHeroAttributesPage);
    const heroAttributesTable = $parse("table").first()

    const columns = $parse("tbody > tr > th", heroAttributesTable)
      .map((_, column) => {
        const columnText = $parse(column).text().replace(/\n/, '');
        const columnTooltip = $parse("span", column).attr("title")
        const columnName = `${columnText}${columnTooltip ? ` (${columnTooltip})` : ''}`
        return columnName
      })
      .toArray()

    const heroes = [];
    let hero;

    $parse("tbody > tr > td", heroAttributesTable).each((index, testing) => {
      const columnNameIndex = index % columns.length;

      if (columnNameIndex === 0) {
        if (index > 0) {
          heroes.push(hero)
        }
        hero = {}
      }

      const text = $parse(testing).text();
      const title = $parse("a", testing).attr("title");
      const value = (title || text).replace(/\n/, '');

      const columnName = columns[columnNameIndex]
      hero[columnName] = value
    })

    return heroes
  }
}

module.exports = exports = Dota2GamepediaAPI
