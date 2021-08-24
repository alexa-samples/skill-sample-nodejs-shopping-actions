// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

const constants = require('./constants');

module.exports = {
    /**
     * Returns the target intent 
     * 
     * @param {Object} handlerInput 
     */
    parseIntent(handlerInput) {
        if(handlerInput.requestEnvelope.request.type === 'IntentRequest') {
            return handlerInput.requestEnvelope.request.intent.name;
        } else {
            return handlerInput.requestEnvelope.request.type;
        }
    },
    /**
     * Saves the current attributes objects to either the session or to DynamoDB.
     *
     * @param {Object} handlerInput
     * @param {Object} attributes
     * @param {String} mode The save type of persistent or session
     */
    saveUser(handlerInput, attributes, mode) {
        if (mode === 'session') {
            handlerInput.attributesManager.setSessionAttributes(attributes);
        } else if (mode === 'persistent') {
            console.info('Saving to Dynamo: ', attributes);

            if (attributes[constants.FIRST_RUN]) {
                attributes[constants.FIRST_RUN] = false;
            }

            handlerInput.attributesManager.setSessionAttributes(attributes);
            handlerInput.attributesManager.setPersistentAttributes(attributes);
            return handlerInput.attributesManager.savePersistentAttributes();
        }
    }
}