// Announces classes included in Apps Script to JSHint
/* globals FormApp,ScriptApp,Logger,UrlFetchApp */

/**
 * Creates a form submit trigger if one does not already exist
 */
function createFormTrigger() {	//jshint ignore:line
	var form = FormApp.getActiveForm();
	var triggers = ScriptApp.getUserTriggers(form);

	// Create a new trigger if required
	var existingTrigger = null;
	for (var i = 0; i < triggers.length; i++) {
	if (triggers[i].getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
		existingTrigger = triggers[i];
		break;
	}
	}	
	if (!existingTrigger) {
	var trigger = ScriptApp.newTrigger('onSubmit')	//jshint ignore:line
		.forForm(form)
		.onFormSubmit()
		.create();
	}
}

/**
 * Send data to database server
 * 
 * @param {Object} e - The event parameter created by a form submission;
 *      see https://developers.google.com/apps-script/guides/triggers/events#google_forms_events.
 */
function onSubmit(e) {	//jshint ignore:line 
	if (e.authMode !== ScriptApp.AuthMode.FULL) {
		console.error("Permission level is not FULL");
	}

	var responses = {};
	for (var response of e.response.getItemResponses()) {
		Logger.log(response.getItem().getTitle() + ": " + response.getResponse());
		responses[response.getItem().getTitle()] = response.getResponse();
	}
	postToDB(responses);

}

/**
 * Sends a POST request to the database server. I couldn't figure out how to read it
 * when it's as an actual payload so it's just converted to URL paramters
 * 
 * @param {Object} payload - The object to send to the DB
 */
function postToDB(payload) {
	var BASE_URL = 'https://classmate-finder.weirdalex03.repl.co/post';

	var options = {
		'method' : 'post',
	};
	var url = BASE_URL + "?";

	for (var property in payload) {
		console.log(`${property}=${payload[property]}&`);
		url += `${encodeURIComponent(property)}=${encodeURIComponent(payload[property])}&`;
	}

	console.log(url);
	UrlFetchApp.fetch(url, options);

}
