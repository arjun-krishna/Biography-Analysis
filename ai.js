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
	count = 0
	content = content.toLowerCase();
	for (word in keywords) {
		count += content.split(keywords[word]).length - 1;
	}
	if (keywords.length) 
		return Math.min(count/keywords.length,1)
	else
		return 0
}

module.exports.process_token = (token, resolve, reject, req_params) => {
	
	content = readFiles('tmp/'+token+'/');
	if (/\S/.test(content)) {
		var params = {
		  text: content,
		};
		tone_analyzer.tone(params, function(error, response) {
		  if (error) {
		    console.log('error:', error);
		    reject('error');
		  }
		  else {
		    // console.log(JSON.stringify(response, null, 2));
		  	tone_response = response;

    		var params = {
				  content_items: [{
				  	"content" : content,
				  	"contenttype" : "text/plain",
				  	"created" : 1,
				  	"id" : "1",
				  	"language" : "en"
				  }],
				  consumption_preferences: true,
				  raw_scores: true,
				  headers: {
				    'accept-language': 'en',
				    'accept': 'application/json'
				  }
				};

				personality_insights.profile(params, function(error, response) {
				  if (error)
				    console.log('Error:', error);
				  else
				    // console.log(JSON.stringify(response, null, 2));
		  			personality_response = response;	
		  			default_personality_score = 0.0
		  			custom_personality_score = 0.0
		  			custom_names = req_params.personality.split(',')
		  			for (elem in personality_response['personality']) {
		  				obj = personality_response['personality'][elem];
		  				default_personality_score += obj['percentile']
		  				for (child in obj['children']) {
		  					obj2 = obj['children'][child];
		  					if (custom_names.indexOf(obj2['name']) != -1) {
		  						custom_personality_score += obj2['percentile'];
		  					}
		  				}	
		  			}
		  			if (custom_names.length)
		  				personality_score = Math.max(default_personality_score/5.0, custom_personality_score/custom_names.length);
		  			else 
		  				personality_score = default_personality_score/5.0;

		  			needs_score = 0.0
		  			if (req_params.needs) {
			  			custom_needs = req_params.needs
			  			for (elem in personality_response['needs']) {
			  				obj = personality_response['needs'][elem];
			  				if (custom_needs.indexOf(obj['name']) != -1) {
			  					needs_score += obj['percentile'];
			  				}
			  			}
			  			needs_score = needs_score / custom_needs.length;
			  		}

			  		values_score = 0.0
			  		if (req_params.values) {
			  			custom_values = req_params.values
			  			for (elem in personality_response['values']) {
			  				obj = personality_response['values'][elem];
			  				if (custom_needs.indexOf(obj['name']) != -1) {
			  					values_score += obj['percentile'];
			  				}
			  			}
			  			values_score = values_score / custom_values.length;
			  		}

			  		tones_score = 0.0
			  		if (req_params.tone) {
			  			custom_tones = req_params.tone
			  			for (elem in tone_response['document_tone']['tone_categories']) {
			  				obj = tone_response['document_tone']['tone_categories'][elem]
			  				for (t in obj['tones']) {
			  					obj2 = obj['tones'][t]
			  					if (custom_tones.indexOf(obj2['tone_name']) != -1) {
			  						tones_score += obj2['score']
			  					}
			  				}
			  			}
			  			tones_score /= custom_tones.length;
			  		}

			  		// custom keyword match
			  		keywords = req_params.keywords.toLowerCase().split(',');
			  		key_word_score = keyword_analyzer(content, keywords);

		  			scores = [key_word_score, personality_score, needs_score, values_score, tones_score]
		  			total_score = 0.0
		  			cscored = 0
		  			for (i in scores) {
		  				if (scores[i] > 0.3) {
		  					total_score += scores[i]
		  					cscored += 1
		  				}
		  			}
		  			score = total_score / cscored;
		  			output = {'content' : content, 'score' : score, 'personality' : personality_response}
		  			resolve(output);
				  }
				);


		  } 
		});

	} else {
		reject('error');
	}
}




