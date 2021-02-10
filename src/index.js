const Dota2GamepediaAPI = require("./Dota2GamepediaAPI.js");

async function init() {
  const d2gapi = new Dota2GamepediaAPI()
  const heroes = await d2gapi.getHeroes()
  console.log(heroes)
}

init()
