// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

describe('Account Settings > Display > Clock Display Mode', () => {
    const mainMessage = 'Test for clock display mode';
    const replyMessage1 = 'Reply 1 for clock display mode';
    const replyMessage2 = 'Reply 2 for clock display mode';

    before(() => {
        // # Login as new user, visit town-square and post a message
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
            cy.postMessage(mainMessage);

            // # Open RHS and post two consecutive replies
            cy.clickPostCommentIcon();
            cy.postMessageReplyInRHS(replyMessage1);
            cy.postMessageReplyInRHS(replyMessage2);
        });
    });

    after(() => {
        // # Set clock display to 12-hour
        setClockDisplayTo12Hour();
    });

    it('MM-T2098 Clock display mode setting to "12-hour clock"', () => {
        // # Set clock display to 12-hour
        setClockDisplayTo12Hour();

        // * Verify clock format is 12-hour for main message
        cy.getNthPostId(1).then((postId) => {
            verifyClockFormatIs12HourForPostWithMessage(postId, mainMessage);
        });

        // * Verify clock format is 12-hour for reply message 1
        cy.getNthPostId(-2).then((postId) => {
            verifyClockFormatIs12HourForPostWithMessage(postId, replyMessage1);
        });

        // * Verify clock format is 12-hour for reply message 2
        cy.getNthPostId(-1).then((postId) => {
            verifyClockFormatIs12HourForPostWithMessage(postId, replyMessage2);
        });
    });

    it('MM-T2096 Clock display mode setting to "24-hour clock"', () => {
        // # Set clock display to 24-hour
        setClockDisplayTo24Hour();

        // * Verify clock format is 24-hour for main message
        cy.getNthPostId(1).then((postId) => {
            verifyClockFormatIs24HourForPostWithMessage(postId, mainMessage);
        });

        // * Verify clock format is 24-hour for reply message 1
        cy.getNthPostId(-2).then((postId) => {
            verifyClockFormatIs24HourForPostWithMessage(postId, replyMessage1);
        });

        // * Verify clock format is 24-hour for reply message 2
        cy.getNthPostId(-1).then((postId) => {
            verifyClockFormatIs24HourForPostWithMessage(postId, replyMessage2);
        });
    });
});

function navigateToClockDisplaySettings() {
    // # Go to Account Settings
    cy.toAccountSettingsModal();

    // # Click the display tab
    cy.get('#displayButton').should('be.visible').click();

    // # Click "Edit" to the right of "Clock Display"
    cy.get('#clockEdit').should('be.visible').click();

    // # Scroll a bit to show the "Save" button
    cy.get('.section-max').should('be.visible').scrollIntoView();
}

function setClockDisplayTo(clockFormat) {
    // # Navigate to Clock Display Settings
    navigateToClockDisplaySettings();

    // # Click the radio button
    cy.get(`#${clockFormat}`).should('be.visible').click({force: true});

    // # Click Save button and close Account Settings modal
    cy.get('#saveSetting').should('be.visible').click();
    cy.get('#accountSettingsHeader > .close').should('be.visible').click();
}

function setClockDisplayTo12Hour() {
    setClockDisplayTo('clockFormatA');
}

function setClockDisplayTo24Hour() {
    setClockDisplayTo('clockFormatB');
}

function verifyClockFormat(isHour12) {
    cy.get('time').first().then(($timeEl) => {
        cy.wrap($timeEl).invoke('attr', 'datetime').then((dateTimeString) => {
            const formattedDateTime = new Date(dateTimeString).toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: isHour12});
            cy.wrap($timeEl).should('be.visible').and('have.text', formattedDateTime);
        });
    });
}

function verifyClockFormatIs12Hour() {
    verifyClockFormat(true);
}

function verifyClockFormatIs24Hour() {
    verifyClockFormat(false);
}

function verifyClockFormatIs12HourForPostWithMessage(postId, message) {
    // * Verify clock format is 12-hour in center channel within the post
    cy.get(`#post_${postId}`).within(($postEl) => {
        cy.wrap($postEl).find('.post-message__text').should('have.text', message);
        verifyClockFormatIs12Hour();
    });

    // * Verify clock format is 12-hour in RHS within the RHS post
    cy.get(`#rhsPost_${postId}`).within(($rhsPostEl) => {
        cy.wrap($rhsPostEl).find('.post-message__text').should('have.text', message);
        verifyClockFormatIs12Hour();
    });
}

function verifyClockFormatIs24HourForPostWithMessage(postId, message) {
    // * Verify clock format is 24-hour in center channel within the post
    cy.get(`#post_${postId}`).within(($postEl) => {
        cy.wrap($postEl).find('.post-message__text').should('have.text', message);
        verifyClockFormatIs24Hour();
    });

    // * Verify clock format is 24-hour in RHS within the RHS post
    cy.get(`#rhsPost_${postId}`).within(($rhsPostEl) => {
        cy.wrap($rhsPostEl).find('.post-message__text').should('have.text', message);
        verifyClockFormatIs24Hour();
    });
}
