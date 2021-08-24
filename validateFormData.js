
// eslint sourceType: "module"

/**
 * Error that indicates that the form data is invalid.
 * @class
 * @classdesc Error that indicates that the form data is invalid.
 * @param {?string} message - Error message.
 * @extends Error
 */
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}

/**
 * Validates the recieved form data is valid and fit for the database
 * @param {Object} data - The data to be checked for the database
 * @throws {ValidationError} If the data is invalid
 */
module.exports = function validateFormData(qData) {
	/** @type {string[]} */
	const reqFields = [
		"Your name",
		"Discord Tag",
		"PIN - at least 4 digits",
		"Class Entries"
	];

	// Check that all necessary fields are filled in
	for (const field of reqFields) {
		if (!qData[field]) {
			throw new ValidationError(`Missing ${field}`);
		}
	}

	/** @type {number} */
	const numClassEntries = parseInt(qData["Class Entries"], 10);

	/** @type {number} */
	var numClassesFilled = 0;

	// Check that all classes are valid
	for (var i = 1; i <= numClassEntries; i++) {
		if (qData[`Class ${i}`]) {
			numClassesFilled++;

			/** 
			 * Full class code as provided by the user, with
			 * department, number, section, and subsection.
			 * @type {string}
			 * @example "MTH 141LEC - A1"
			 * @example "TH 106 - JS"
			 */
			var classCode = qData[`Class ${i}`];

			/**
			 * Array of RegEx matches on {@link classCode}.
			 * @type {Array}
			 */
			var classCodeSections = classCode.match(/(?<code>[A-Z]{2,3} [0-9]{3})[A-Z]* - (?<section>[A-Z]+)(?<subsection>[0-9]*)/u);

			/** @type {string[]} */
			const reqGroups = ["code", "section"];

			// Check that all necessary fields are filled in
			for (const group of reqGroups) {
				if (!classCodeSections.groups[group]) {
					throw new ValidationError(`Missing ${group} for
					class ${i}`);
				}
			}
		}
	}

	// Check that at least one class was filled in
	if (numClassesFilled === 0) {
		throw new ValidationError("Missing filled in classes");
	}
};
