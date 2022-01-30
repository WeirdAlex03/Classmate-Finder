"use strict";
/**
 * @file Client side functions to validate the class input form before
 *       submitting, and associated helpers
 */
/* eslint-env browser */
/**
 * A generic error representing indicating the form is invalid
 *
 * @param {string} message The message to display
 *
 * @extends {Error}
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
/**
 * A ValidationError representing a field that is required but empty
 *
 * @param {string} fieldName The friendly name of the field that is missing
 * @param {string} fieldId   The HTML ID of the field that is missing
 *
 * @extends {ValidationError}
 */
class MissingDataError extends ValidationError {
    constructor(fieldName, fieldId) {
        super(`Missing data for ${fieldName}`);
        this.name = "MissingDataError";
        this.fieldId = fieldId;
    }
}
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function validateForm() {
    var _a;
    try {
        const valid = validateFields();
        if (valid) {
            const form = document.getElementById("classes");
            form.submit();
        }
    }
    catch (err) {
        if (err instanceof MissingDataError) {
            alert(err.message);
            console.error(err);
            (_a = document.getElementById(err.fieldId)) === null || _a === void 0 ? void 0 : _a.focus();
        }
        else if (err instanceof ValidationError) {
            alert(err.message);
            console.error(err);
        }
        else {
            alert("An unknown error occurred:\n" + err);
            console.error(err);
            throw err;
        }
    }
}
/**
 * Validates the data in the form, calling sub-functions for each part
 *
 * @returns {boolean} True if the form is valid, otherwise false w/ an error
 *
 * @throws {ValidationError} if a field contains invalid data
 * @throws {MissingDataError} if a required field is empty
 */
function validateFields() {
    let valid = true;
    /** @type {HTMLCollectionOf<HTMLFieldSetElement>} */
    const fields = document.getElementsByTagName("fieldset");
    // Validate each fieldset
    let hasName = false;
    let hasClass = false;
    for (const field of fields) {
        if (field.className === "nameField") {
            hasName = true;
            try {
                validateName(field);
            }
            catch (err) {
                valid = false;
                throw err;
            }
        }
        else if (field.className === "classField") {
            try {
                validateClass(field);
            }
            catch (err) {
                valid = false;
                throw err;
            }
        }
        else {
            hasClass = true;
            console.warn("Unknown fieldset class: " + field.className, field);
        }
    }
    if (!hasName) {
        valid = false;
        throw new ValidationError("Internal error: \"Identity\" fieldset is missing");
    }
    if (!hasClass) {
        valid = false;
        throw new ValidationError("Internal error: No class fieldsets were found");
    }
    return valid;
}
/**
 * Validates the name section
 *
 * - Name:        Required, must be at least 2 characters
 * - Discord tag: Required, must be a valid Discord tag
 * - Password:    Required, no further conditions
 *
 * @param {HTMLFieldSetElement} nameField The fieldset containing the
 *                                        identity questions
 *
 * @throws {MissingDataError} if a required field is empty
 * @throws {ValidationError} if a field input is invalid or missing altogether
 *
 */
function validateName(nameField) {
    const nameInput = nameField.querySelector("input[name=name]");
    const discordInput = nameField.querySelector("input[name=discord]");
    const passwordInput = nameField.querySelector("input[name=password]");
    // Ensure fields are present and not empty
    for (const input of [nameInput, discordInput, passwordInput]) {
        if (!input) {
            console.error("Internal error: \"Identity\" fieldset is missing required fields", nameField);
            throw new ValidationError("Internal error: \"Identity\" fieldset is missing required fields");
        }
        else if (input.value === "") {
            /** Field name with first character capitalized */
            const name = input.name.charAt(0).toUpperCase() + input.name.slice(1);
            throw new MissingDataError(name, input.id);
        }
    }
    // Further field-specific validation
    if (nameInput.value.length < 2) {
        throw new ValidationError("Name must be at least 2 characters");
    }
    if (!discordInput.value.match(/^[0-9]{4,}$/)) {
        throw new ValidationError("Discord tag must be a valid Discord tag (don't forget the 4 numbers at the end)");
    }
}
/**
 * Validates the class sections
 *
 * - Department:    Required, must be two or three letters
 * - Course number: Required, must be a 3-digit number
 * - Section:       Optional, must have at least one letter
 * - Lab:           Optional, must have at least one digit
 *
 * @param {HTMLFieldSetElement} classField A fieldset containing class inputs
 *
 * @throws {MissingDataError} if a required field is empty
 * @throws {ValidationError} if a field input is invalid or missing altogether
 */
function validateClass(classField) {
    const classNum = classField.id.charAt(classField.id.length - 1);
    const departmentInput = classField.querySelector(`input[name=c${classNum}d]`);
    const courseInput = classField.querySelector(`input[name=c${classNum}c]`);
    const sectionInput = classField.querySelector(`input[name=c${classNum}s]`);
    const labInput = classField.querySelector(`input[name=c${classNum}l]`);
    // Ensure fields are present
    for (const input of [departmentInput, courseInput, sectionInput, labInput]) {
        if (!input) {
            console.error(`Internal error: "Class ${classNum}" fieldset is missing required fields`, classField);
            throw new ValidationError(`Internal error: "Class ${classNum}" fieldset is missing required fields`);
        }
    }
    /*
     * If any fields are filled in, ensure department and course number are
     * also filled in, and all fields are valid
     */
    if (departmentInput.value !== "" || courseInput.value !== "" || sectionInput.value !== "" || labInput.value !== "") {
        if (departmentInput.value === "") {
            throw new MissingDataError(`Class ${classNum} department`, classField.id);
        }
        if (courseInput.value === "") {
            throw new MissingDataError(`Class ${classNum} course number`, classField.id);
        }
        if (!departmentInput.value.match(/^[a-zA-Z]{2,3}$/)) {
            throw new ValidationError(`Class ${classNum} department must be two or three letters`);
        }
        if (!courseInput.value.match(/^[0-9]{3}$/)) {
            throw new ValidationError(`Class ${classNum} course number must be a 3-digit number`);
        }
        if (sectionInput.value !== "" && !sectionInput.value.match(/^[a-zA-Z]{1,}.*$/)) {
            throw new ValidationError(`Class ${classNum} section must have at least one letter`);
        }
        if (labInput.value !== "" && !labInput.value.match(/^[0-9]{1,}.*$/)) {
            throw new ValidationError(`Class ${classNum} lab must have at least one digit`);
        }
    }
}
//# sourceMappingURL=verifyData.js.map