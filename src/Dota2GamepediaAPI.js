const axios = require("axios");
const cheerio = require("cheerio");

class Dota2GamepediaAPI {
  constructor() {
    this.baseURL = "https://dota2.gamepedia.com"
    this.attributes = ["Strength", "Agility", "Intelligence"]
  }

  async getHeroes() {
    const heroesPage = await axios.get(`${this.baseURL}/Heroes`);
    const $parse = cheerio.load(heroesPage.data)
    
    const heroes = this.attributes.reduce((heroesObj, attribute) => {
      heroesObj[attribute] = []

      const heroesTable = $parse(`table > tbody > tr > th > span > a:contains('${attribute}')`)
        .parents("tr")
        .next()

      $parse("div > div > a", heroesTable).each((_, hero) => {
        const heroImage = hero.children[0].attribs

        const newHero = {
          name: hero.attribs.title,
          url: hero.attribs.href,
          image: {
            url: heroImage.src,
            alt: heroImage.alt
          }
        }

        heroesObj[attribute].push(newHero)
      })

      return heroesObj
    }, {})

    return heroes
  }
}

module.exports = exports = Dota2GamepediaAPI
