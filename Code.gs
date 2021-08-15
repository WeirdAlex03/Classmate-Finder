// Announces classes included in Apps Script to JSHint
/* globals FormApp,ScriptApp,Logger,UrlFetchApp */

/**
 * Creates a form submit trigger if one does not already exist
 */
// eslint-disable-next-line no-unused-vars
function createFormTrigger() {
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
		// eslint-disable-next-line no-unused-vars
		var trigger = ScriptApp.newTrigger("onSubmit")
			.forForm(form)
			.onFormSubmit()
			.create();
	}
}

/**
 * Sends a POST request to the database server. I couldn't figure out how to
 * read itwhen it's as an actual payload so it's just converted to URL paramters
 * 
 * @param {Object} payload - The object to send to the DB
 */
function postToDB(payload) {
	var BASE_URL = "https://classmate-finder.weirdalex03.repl.co/post";

	var options = {
		method: "post",
	};
	var url = BASE_URL + "?";

	for (var property in payload) {
		url += encodeURIComponent(property) + "="
		     + encodeURIComponent(payload[property]) + "&";
	}

	UrlFetchApp.fetch(url, options);

}

/**
 * Send data to database server
 * 
 * @param {Object} e - The event parameter created by a form submission;
 *      see https://developers.google.com/apps-script/guides/triggers/events#google_forms_events.
 */
// eslint-disable-next-line no-unused-vars -- Part of the Google Apps Script API
function onSubmit(e) {
	if (e.authMode !== ScriptApp.AuthMode.FULL) {
		console.error("Permission level is not FULL");
	}

	var responses = {};
	for (var response of e.response.getItemResponses()) {
		responses[response.getItem().getTitle()] = response.getResponse();
	}
	postToDB(responses);

}
