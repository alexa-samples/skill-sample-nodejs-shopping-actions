// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

/* CONSTANTS */
const Alexa = require('ask-sdk');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const config = require('./config');
const constants = require('./constants');

// Files for each of the handlers
const handlers = require('./handlers');
const shop = require('./shopping');

// i18n library dependency, we use it below in a localization interceptor
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
// i18n strings for all supported locales
const languageStrings = {
    //  'de': require('languages\de.js'),
    //  'de-DE': require('languages\de-DE.js'),
    //  'en' : require('languages\en.js'),
    //  'en-AU': require('languages\en-AU.js'),
    //  'en-CA': require('languages\en-CA.js'),
    'en-GB': require('languages/en-GB.js'),
    //  'en-IN': require('languages\en-IN.js'),
    'en-US': require('languages/en-US.js'),
    //  'es' : require('languages\es.js'),
    //  'es-ES': require('languages\es-ES.js'),
    //  'es-MX': require('languages\es-MX.js'),
    //  'es-US': require('languages\es-US.js'),
    //  'fr' : require('languages\fr.js'),
    //  'fr-CA': require('languages\fr-CA.js'),
    //  'fr-FR': require('languages\fr-FR.js'),
    //  'it' : require('languages\it.js'),
    //  'it-IT': require('languages\it-IT.js'),
    //  'ja' : require('languages\ja.js'),
    //  'ja-JP': require('languages\ja-JP.js'),
    //  'pt' : require('languages\pt.js'),
    //  'pt-BR': require('languages\pt-BR.js'),
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings,
        });
        localizationClient.localize = function localize() {
            const args = arguments;
            const values = [];
            for (let i = 1; i < args.length; i += 1) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values,
            });
            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            }
            return value;
        };
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        requestAttributes.t = function translate(...args) {
            return localizationClient.localize(...args);
        };
    },
};

/**
 * If this is the first start of the skill, grab the user's data from data store and
 * set the session attributes to the persistent data.
 */
const GetUserDataInterceptor = {
    process(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;
        console.log('Request: ', JSON.stringify(handlerInput));
        if (requestEnvelope.session && requestEnvelope.session.new === true) {
            return new Promise((resolve, reject) => {
                attributesManager
                    .getPersistentAttributes()
                    .then(attributes => {
                        console.info('Initializing the user data from date store.')
                        if (attributes[constants.FIRST_RUN] === undefined) {
                            // Set the starting attributes for new user
                            attributes[constants.FIRST_RUN] = true;
                        }

                        attributesManager.setSessionAttributes(attributes);
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
    }
};

const LogRequestInterceptor = {
	process(handlerInput) {
        console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
	}
};

const LoggingResponseInterceptor = {
    process(handlerInput) {
        console.log(`RESPONSE ENVELOPE = ${JSON.stringify(handlerInput.response)}`);
    }
};

/* FUNCTIONS */
function getPersistenceAdapter(tableName) {
    // Determines persistence adapter to be used based on environment
    // Note: tableName is only used for DynamoDB Persistence Adapter
    if (process.env.S3_PERSISTENCE_BUCKET) {
      // in Alexa Hosted Environment
      // eslint-disable-next-line global-require
      const s3Adapter = require('ask-sdk-s3-persistence-adapter');
      return new s3Adapter.S3PersistenceAdapter({
        bucketName: process.env.S3_PERSISTENCE_BUCKET,
      });
    }
  
    // Not in Alexa Hosted Environment
    return new ddbAdapter.DynamoDbPersistenceAdapter({
      tableName: tableName,
      createTable: true,
    });
  }

/* LAMBDA SETUP */
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(getPersistenceAdapter(config.TABLE_NAME))
    .addRequestHandlers(
        handlers.LaunchHandler,
        handlers.CancelAndStopIntentHandler,
        shop.SessionResumedHandler,
        shop.BuyPromptHandler,
        shop.CartPromptHandler,
        shop.YesHandler,
        shop.NoHandler,
        handlers.HelpHandler,
        shop.RefundHandler,
        handlers.SessionEndedRequestHandler,
        handlers.UnhandledIntentHandler
    )
    .addErrorHandlers(handlers.ErrorHandler)
    .addRequestInterceptors(
        GetUserDataInterceptor, LocalizationInterceptor, LogRequestInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .lambda();