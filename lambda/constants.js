// Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

module.exports = Object.freeze({
    // define the application states to handle the different interactions
    STATES: {
      MENU: '_MENU_MODE',
      CART: '_CART_MODE',
      BUY: '_BUY_MODE'
    },

    STATE: 'SKILL_STATE',
    FIRST_RUN: 'NEW_USER',
    ITEM: 'SHOPPING_ITEM'
});