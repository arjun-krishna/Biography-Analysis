var fs = require('fs');

// 																WATSON SERVICES
// ---------------------------------------------------------------------------------------
credentials = require('./credentials.js')

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({
  username: credentials.tone_analyzer.username,
  password: credentials.tone_analyzer.password,
  version_date: '2016-05-19'
});

var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
var personality_insights = new PersonalityInsightsV3({
  username: credentials.personality_insights.username,
  password: credentials.personality_insights.password,
  version_date: '2017-10-13'
});

// var watson = require('watson-developer-cloud');
// var language_translator = watson.language_translator({
//   username: credentials.language_translator.username,
//   password: credentials.language_translator.password,
//   version: 'v2'
// });
// ---------------------------------------------------------------------------------------

function readFiles(dirname) {
  filenames = fs.readdirSync(dirname);
  concat_content = ''
	filenames.forEach(function(filename) {
		content = fs.readFileSync(dirname + filename, 'utf8');
	  concat_content += content + '\n';
	});
	return concat_content;
}

function keyword_analyzer(content, keywords) {

}

module.exports.process_token = (token, resolve, reject) => {
	content = readFiles('tmp/'+token+'/');
	if (/\S/.test(content)) {
		// var params = {
		//   text: content,
		// };
		// tone_analyzer.tone(params, function(error, response) {
		//   if (error)
		//     console.log('error:', error);
		//   else {
		//     console.log(JSON.stringify(response, null, 2));
		//   	resolve({'test': content});
		//   } 
		// });
		// var params = {
		//   content_items: [{
		//   	"content" : content,
		//   	"contenttype" : "text/plain",
		//   	"created" : 1,
		//   	"id" : "1",
		//   	"language" : "en"
		//   }],
		//   consumption_preferences: true,
		//   raw_scores: true,
		//   headers: {
		//     'accept-language': 'en',
		//     'accept': 'application/json'
		//   }
		// };

		// personality_insights.profile(params, function(error, response) {
		//   if (error)
		//     console.log('Error:', error);
		//   else
		//     console.log(JSON.stringify(response, null, 2));
		//   }
		// );

		resolve({'test' : content});
	} else {
		reject('error');
	}
}




