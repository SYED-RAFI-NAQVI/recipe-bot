import fetch from "node-fetch";
import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

import { WebhookClient } from "dialogflow-fulfillment";
var output = [];
var recipes = [];
// let APIKEY = "1bcdd59af2a741b38a9252b824e3d5ba";
const APIKEY = "c9dde6ef727742849aaecbc689816181";

app.post("/", async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function foodRecepieHandler(agent) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${APIKEY}&ingredients=${agent.parameters.ingredient_1},+${agent.parameters.ingredients_2},+${agent.parameters.ingredients_3}&number=3`;
    return fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.length > 0 && data.length < 3) {
          output.push(
            {
              name: data[0].title,
              id: data[0].id,
            },
            {
              name: data[1].title,
              id: data[1].id,
            },
            {
              name: data[2].title,
              id: data[2].id,
            }
          );
          recipes.push(
            {
              name: data[0].title,
              id: data[0].id,
            },
            {
              name: data[1].title,
              id: data[1].id,
            },
            {
              name: data[2].title,
              id: data[2].id,
            }
          );
          agent.end("");
        }
      });
  }

  function ingredientHandler(agent) {
    const msg = `The top 3 recipe recommendations are ${recipes[0].name}, \n  ${recipes[1].name}, \n ${recipes[2].name}`;
    agent.add(msg);
    agent.add("");
  }

  function getRecipeHandler(agent) {
    const recipesUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${agent.parameters.recipe_name}&apiKey=${APIKEY}`;
    let msg = "choose one of the following recipes: ";
    return fetch(recipesUrl)
      .then((resp) => resp.json())
      .then((data) => {
        if (data.results.length > 0) {
          data.results.map((item) => {
            msg += item.title + " \n , ";
          });
          return agent.add(msg);
        }
      });
  }

  function getStepsHandler(agent) {
    const recipesUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${agent.parameters.recipe_name}&addRecipeInformation=true&apiKey=${APIKEY}`;
    return fetch(recipesUrl)
      .then((resp) => resp.json())
      .then((data) => {
        let msg = "The steps are: ";
        data.results[0].analyzedInstructions[0].steps.map((item) => {
          msg += item.number + ". " + item.step + " ";
        });
        console.log(msg);
        return agent.add(msg);
      });
  }

  function getFoodJokeHandler(agent) {
    const url = `https://api.spoonacular.com/food/jokes/random?apiKey=${APIKEY}`;
    return fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        if (data) {
          return agent.add(data.text);
        }
      });
  }

  let intentMap = new Map();
  intentMap.set("get_ingredient", foodRecepieHandler);
  intentMap.set("get_ingredient_yes", ingredientHandler);
  intentMap.set("get_recipe", getRecipeHandler);
  intentMap.set("get_recipe_chooserecipe", getStepsHandler);
  intentMap.set("get_food_joke", getFoodJokeHandler);
  agent.handleRequest(intentMap);
  recipes = [];
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port} || 8000`);
});
// // 1bcdd59af2a741b38a9252b824e3d5ba
// https://api.spoonacular.com/recipes/findByIngredients?apikey=1bcdd59af2a741b38a9252b824e3d5ba&ingredients=apples,+flour,+sugar&number=2
// https://api.spoonacular.com/recipes/findByIngredients?apiKey=1bcdd59af2a741b38a9252b824e3d5ba&ingredients=apples,+flour,+sugar&number=1
// https://api.spoonacular.com/recipes/random?apiKey=1bcdd59af2a741b38a9252b824e3d5ba&number=10
