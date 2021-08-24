// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
/*********************************************************************
 * Description: Common handlers for built-in intents.
 * LaunchRequest, AMAZON.HelpIntent, AMAZON.StopIntent,
 * AMAZON.CancelIntent, Unhandled, SessionEndedRequest, and the Error
 * Handler.
 *********************************************************************/
// Import helper functions and data
const constants = require('./constants.js');
const util = require('./util.js')

module.exports = {
    /**
     * Handler for when a skill is launched. Delivers a response based on if a user is new or
     * returning.
     */
    LaunchHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'LaunchRequest';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info('LaunchRequest');

            // Determine if the user is new or returning and build a welcome speakOutput.
            let speakOutput = sessionAttributes[constants.FIRST_RUN] ? 
            requestAttributes.t('WELCOME_LONG') : requestAttributes.t('WELCOME_BACK');
            speakOutput = `${speakOutput} ${requestAttributes.t('MAIN_MENU')}`;
            let repromptOutput = requestAttributes.t('MAIN_MENU');

            sessionAttributes[constants.STATE] = constants.STATES.MENU;

            return responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
        }
    },

    /**
     * Central handler for the AMAZON.HelpIntent.
     * Delivers a summary of skill functionality and then prompts with the main menu.
     */
    HelpHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'AMAZON.HelpIntent';
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, AMAZON.HelpIntent`);

            let repromptOutput = requestAttributes.t('MAIN_MENU');
            let speakOutput = requestAttributes.t('HELP');

            return responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
        }
    },

    /**
     * Central handler for the AMAZON.StopIntent and AMAZON.CancelIntent.
     * Handler saves the session to DynamoDB and then sends a goodbye speakOutput.
     */
    CancelAndStopIntentHandler: {
        canHandle(handlerInput) {
            return ['AMAZON.CancelIntent','AMAZON.StopIntent'].includes(util.parseIntent(handlerInput));
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, AMAZON.StopIntent`);
            util.saveUser(handlerInput, sessionAttributes, 'persistent');

            let speakOutput = requestAttributes.t('GOODBYE');
    
            return responseBuilder
                .speak(speakOutput)
                .withShouldEndSession(true)
                .getResponse();
        }
    },

    /**
     * Central handler for the SessionEndedRequest when the user says exit
     * or another session ending event occurs. Handler saves the session to
     * DynamoDB and exits.
     */
    SessionEndedRequestHandler: {
        canHandle(handlerInput) {
            return util.parseIntent(handlerInput) === 'SessionEndedRequest';
        },
        handle(handlerInput) {
            console.info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

            util.saveUser(handlerInput, sessionAttributes, 'persistent');

            return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
        }
    },

    /**
     * Catch all for when the skill cannot find a canHandle() that returns true.
     */
    UnhandledIntentHandler: {
        canHandle() {
            return true;
        },
        handle(handlerInput) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();
            let sessionAttributes = attributesManager.getSessionAttributes();

            console.info(`${sessionAttributes[constants.STATE]}, Unhandled`);

            let repromptOutput = requestAttributes.t('MAIN_MENU');
            let speakOutput = `${requestAttributes.t('FALLBACK')} ${repromptOutput}`;

            return responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
                .getResponse();
        }
    },

    /**
     * Central error handler
     */
    ErrorHandler: {
        canHandle() {
            return true;
        },
        handle(handlerInput, error) {
            const { attributesManager, responseBuilder } = handlerInput;
            const requestAttributes = attributesManager.getRequestAttributes();

            console.error(`Error handled: ${error.speakOutput}`);
            console.error('Full error: ', error);

            let repromptOutput = requestAttributes.t('MAIN_MENU');
            let speakOutput = `${requestAttributes.t('ERROR')} ${repromptOutput}`;

            return responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
                .getResponse();
        }
    },
};