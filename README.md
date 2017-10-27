Biography Analysis
------------------
An application that uses NLP services of IBM Watson to take in documents and assess the personality of the person. This application can used to obtain match scores for a submitted set of documents by a candidate (like SOPs, essays etc.,). 

Uses the following APIs : 
* tone-service
* personality-insight

install dependencies 
---------------------
```shell
 npm install
```

start application
------------------
```shell
 npm start
```

Visit http://localhost:3000/ to view the interface.

==========================================================================================

Create a credentials.js in the current folder with the following content, to access IBM WATSON services.

```javascript
module.exports.language_translator = {
  "url": "https://gateway.watsonplatform.net/language-translator/api",
  "username": "user-name",
  "password": "password"
}

module.exports.personality_insights = {
  "url": "https://gateway.watsonplatform.net/personality-insights/api",
  "username": "user-name",
  "password": "password"
}

module.exports.tone_analyzer = {
  "url": "https://gateway.watsonplatform.net/tone-analyzer/api",
  "username": "user-name",
  "password": "password"
}
```