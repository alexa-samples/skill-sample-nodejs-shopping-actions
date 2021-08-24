// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/
/*********************************************************************
 * Description: Handlers for Alexa Shopping Actions tasks. Covers
 * examples for both the Add to Cart and Buy actions. 
 *********************************************************************/
 const constants = require('./constants');
 const util = require('./util.js')
 
 // Example object to store ASIN data for multiple locales
 const asins = Object.freeze({
     "yoga-blocks": {
         "en-US": {
             "title": "Yoga Blocks",
             "asin": "B01FN7X7KE"
         },
         "en-GB": {
             "title": "Yoga Blocks",
             "asin": "B08FRKDTXV"
         }
     },
     "yoga-mat":{
         "en-US":{
             "title":"Yoga Mat",
             "asin":"B01LP0U5X0"
         },
         "en-GB":{
             "title":"Yoga Mat",
             "asin":"B0749TDKJN"
         }
     }
 });
 
 function generateCartDirective(locale, product) {
     let actionTask = {
         'type': 'Connections.StartConnection',
         'uri': 'connection://AMAZON.AddToShoppingCart/1',
         'input': {
              'products' : [
                {
                  'asin' : product[locale]["asin"]
                }
              ]
           },
         'token': 'AddToShoppingCartToken'
     };
     return actionTask;
 }
 
 function generatePurchaseDirective(locale, product) {
     let actionTask = {
         'type': 'Connections.StartConnection',
         'uri': 'connection://AMAZON.BuyShoppingProducts/1',
         'input': {
              'products' : [
                {
                  'asin' : product[locale]["asin"]
                }
              ]
           },
         'token': 'PurchaseProductToken'
     };
     return actionTask;
 }
 
 module.exports = {
 
     /**
      * SessionResumedHandler for handling responses from the Alexa Shopping Actions service. 
      */
     SessionResumedHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'SessionResumedRequest';
         },
         handle(handlerInput) {
             const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
             
             console.info(`${sessionAttributes[constants.STATE]}, SessionResumedRequest`);
             let request = requestEnvelope.request;
 
             let speakOutput = requestAttributes.t('ERROR');
 
             if (request.cause) {
                 const token = request.cause.token;
                 const status = request.cause.status;
                 const code = status.code;
                 const speak = status.speakItem;
                 const payload = request.cause.result;
         
                 console.info(`[Shopping Response] ${JSON.stringify(request)}`);
         
                 console.info(`[INFO] Shopping Action Result: Code - ${code}, speakItem - ${speak}, Payload - ${payload}`);
 
                 switch(code) {
                     case '200':
                         if (typeof payload !== "undefined") {                            
                             if (payload.code === "AlexaShopping.RetryLaterError") {
                                 speakOutput = requestAttributes.t('RETRY_TRANSITION');
                             } else {
                                 speakOutput = (sessionAttributes[constants.STATE] === constants.STATES.BUY) ? 
                                 requestAttributes.t('BUY_FAIL') : requestAttributes.t('CART_FAIL');
                             }
 
                             console.info(`[INFO] Shopping Action had an issue while performing the request. ${payload.speakOutput}`);
                         } else {
                             if (token === "AddToShoppingCartToken") {
                                 console.info(`[INFO] Shopping Action: Action was a success for ${token}.`)
                                 speakOutput = requestAttributes.t('CART_SUCCESS');
     
                             } else if (token === "PurchaseProductToken") {
                                 console.info(`[INFO] Shopping Action: Action was a success for ${token}.`)
                                 speakOutput = requestAttributes.t('BUY_SUCCESS');
                             }
                         }
     
                         break;
                     default : 
                         console.info(`[INFO] Shopping Action: There was a problem performing the shopping action.`)
                         speakOutput = (sessionAttributes[constants.STATE] === constants.STATES.BUY) ? 
                             requestAttributes.t('BUY_FAIL') : requestAttributes.t('CART_FAIL');
                 }
             }
 
             sessionAttributes[constants.STATE] = constants.STATES.MENU;
             let repromptOutput = requestAttributes.t('MAIN_MENU');
             speakOutput = `${speakOutput} ${repromptOutput}`;
 
             return responseBuilder
             .speak(speakOutput)
             .reprompt(repromptOutput)
             .getResponse();
         }
     },
 
     /**
      * Sample handler for preparing the offer message to solicit consent from the user to learn more
      * about adding an item to their cart. 
      */
     CartPromptHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'AddToCartIntent';
         },
         handle(handlerInput) {
             const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
 
             console.info(`${sessionAttributes[constants.STATE]}, AddToCart`);
 
             // Store the desired item for add to cart, default to the en-US title if no supported locale present
             const locale = requestEnvelope.request.locale;
             const item = asins["yoga-mat"];
             const title = item[locale] ? item[locale].title : item["en-US"].title;
 
             sessionAttributes[constants.STATE] = constants.STATES.CART;
             sessionAttributes[constants.ITEM] = item;
             let speakOutput = requestAttributes.t('CART_ITEM');
             speakOutput = speakOutput.replace('$1',title);
 
             return responseBuilder
             .speak(speakOutput)
             .reprompt(speakOutput)
             .getResponse();
         }
     },
 
     /**
      * Sample handler for preparing the offer message to solicit consent from the user to learn more
      * about purchasing an item. 
      */
     BuyPromptHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'BuyItemIntent';
         },
         handle(handlerInput) {
             const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
 
             console.info(`${sessionAttributes[constants.STATE]}, BuyItem`);
 
             // Store the desired item for add to cart, default to the en-US title if no supported locale present
             const locale = requestEnvelope.request.locale;
             const item = asins["yoga-mat"];
             const title = item[locale] ? item[locale].title : item["en-US"].title;
 
             sessionAttributes[constants.STATE] = constants.STATES.BUY;
             sessionAttributes[constants.ITEM] = item;
             let speakOutput = requestAttributes.t('BUY_ITEM');
             speakOutput = speakOutput.replace('$1',title);
 
             return responseBuilder
             .speak(speakOutput)
             .reprompt(speakOutput)
             .getResponse();
         }
     },
 
     /**
      * Sample AMAZON.YesIntent handler for determining if the user granted consent for
      * the buy or add to cart action. Hands off a purchase or add to cart directive
      * to Alexa Shopping Actions. 
      */
     YesHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'AMAZON.YesIntent';
         },
         handle(handlerInput) {
             const { attributesManager, requestEnvelope, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
 
             console.info(`${sessionAttributes[constants.STATE]}, YesIntent`);
 
             if(sessionAttributes[constants.STATE] === constants.STATES.CART) {
                 const product = sessionAttributes[constants.ITEM];
                 return responseBuilder
                 .speak("")
                 .reprompt("")
                 .addDirective(generateCartDirective(requestEnvelope.request.locale, product))
                 .withShouldEndSession(undefined)
                 .getResponse();
             } else if(sessionAttributes[constants.STATE] === constants.STATES.BUY) {
                 const product = sessionAttributes[constants.ITEM];
                 return responseBuilder
                 .speak("")
                 .reprompt("")
                 .addDirective(generatePurchaseDirective(requestEnvelope.request.locale, product))
                 .withShouldEndSession(undefined)
                 .getResponse();
             } else {
                let repromptOutput = requestAttributes.t('MAIN_MENU');
                let speakOutput = `${requestAttributes.t('FALLBACK')} ${repromptOutput}`;
    
                return responseBuilder
                    .speak(speakOutput)
                    .reprompt(repromptOutput)
                    .getResponse();
             }
         }
     },
 
     /**
      * Sample AMAZON.NoIntent handler for determining if the user declined the consent to 
      * buy or add to cart. 
      */
     NoHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'AMAZON.NoIntent';
         },
         handle(handlerInput) {
             const { attributesManager, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
 
             console.info(`${sessionAttributes[constants.STATE]}, NoIntent`);
 
             let speakOutput = requestAttributes.t('FALLBACK');
 
             if(sessionAttributes[constants.STATE] === constants.STATES.BUY) {
                 speakOutput = requestAttributes.t('BUY_DECLINE');
             } else if (sessionAttributes[constants.STATE] === constants.STATES.CART) {
                 speakOutput = requestAttributes.t('CART_DECLINE');
             }
 
             let repromptOutput = requestAttributes.t('MAIN_MENU');
             speakOutput = `${speakOutput} ${repromptOutput}`;
             sessionAttributes[constants.STATE] = constants.STATES.MENU;
 
             return responseBuilder
             .speak(speakOutput)
             .reprompt(repromptOutput)
             .getResponse();
         }
     },
 
     /**
      * Sample handler for when a customer asks for a refund. 
      */    
     RefundHandler: {
         canHandle(handlerInput) {
             return util.parseIntent(handlerInput) === 'RefundIntent';
         },
         handle(handlerInput) {
             const { attributesManager, responseBuilder } = handlerInput;
             const requestAttributes = attributesManager.getRequestAttributes();
             let sessionAttributes = attributesManager.getSessionAttributes();
 
             console.info(`${sessionAttributes[constants.STATE]}, RefundIntent`);
 
             let repromptOutput = requestAttributes.t('MAIN_MENU');
             let speakOutput = `${requestAttributes.t('REFUND')} ${repromptOutput}`;
 
             return responseBuilder
             .speak(speakOutput)
             .reprompt(repromptOutput)
             .getResponse();
         }
     }
 };