const express = require("express");
const app = express ();
const __staticDir = "/public";
require("dotenv").config();
const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;
let cachedData;

const query = `
  {
    search(query: "stars:>50000", type: REPOSITORY, first: 10) {
      repositoryCount
      edges {
        node {
          ... on Repository {
            name
            owner {
              login
            }
            stargazers {
              totalCount
            }
          }
        }
      }
    }
  }
`

//lets create the options to send to the API
const options = {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'Authorization': 'token ' + API_KEY
    },
    body: JSON.stringify({query: query}),
}

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res)=> {
    res.sendFile(__staticDir + "index.html");
})

app.get('/data', async (req, res) => {

    if(cachedData){
        //using cached data
        console.log("using cached data", '\n', cachedData);
        res.json(cachedData);
        return;
    } else {
        console.log("requesting new data");
        cachedData = await getDataFromAPI();
        console.log("storing new cache", '\n', cachedData);
        res.json (cachedData);
        return;
    } 

    async function getDataFromAPI () {
        try {
            console.log(options);
            const response = await fetch(API_URL, options);
            const result = await response.json();
    
            console.log("received response",'\n',result);
            return result;

            setTimeout(()=> {
                console.log("claring cache....");
                cachedData = '';
            },6000);
        } catch (ex) {
            console.log("error while doing GraphQL fetch", '\n', ex);
            res.json({err: ex});
            return;
        }
    }

})

app.listen(3000, ()=> console.log("ok"));

console.log(API_KEY, API_URL);
