﻿/**
 * @typedef {object} ContextMenuEntry
 * @property {string} name               The context menu label. Can be localized.
 * @property {string} icon               A string containing an HTML icon element for the menu item
 * @property {function(jQuery)} callback The function to call when the menu item is clicked. Receives the HTML element
 *                                       of the entry that this context menu is for.
 * @property {function(jQuery):boolean} [condition] A function to call to determine if this item appears in the menu.
 *                                                  Receives the HTML element of the entry that this context menu is
 *                                                  for.
 */

/**
 * @callback ContextMenuCallback
 * @param {HTMLElement} target  The element that the context menu has been triggered for.
 */

/**
 * Display a right-click activated Context Menu which provides a dropdown menu of options
 * A ContextMenu is constructed by designating a parent HTML container and a target selector
 * An Array of menuItems defines the entries of the menu which is displayed
 */
export class TitanContextMenu {
    /**
     * @param {HTMLElement|jQuery} element                The containing HTML element within which the menu is positioned
     * @param {string} selector                           A CSS selector which activates the context menu.
     * @param {ContextMenuEntry[]} menuItems              An Array of entries to display in the menu
     * @param {object} [options]                          Additional options to configure the context menu.
     * @param {string} [options.eventName="contextmenu"]  Optionally override the triggering event which can spawn the
     *                                                    menu
     * @param {ContextMenuCallback} [options.onOpen]      A function to call when the context menu is opened.
     * @param {ContextMenuCallback} [options.onClose]     A function to call when the context menu is closed.
     */
    constructor(element, selector, menuItems, {eventName="contextmenu", onOpen, onClose}={}) {

        /**
         * The target HTMLElement being selected
         * @type {HTMLElement}
         */
        this.element = element;

        /**
         * The target CSS selector which activates the menu
         * @type {string}
         */
        this.selector = selector || element.attr("id");

        /**
         * An interaction event name which activates the menu
         * @type {string}
         */
        this.eventName = eventName;

        /**
         * The array of menu items being rendered
         * @type {ContextMenuEntry[]}
         */
        this.menuItems = menuItems;

        /**
         * A function to call when the context menu is opened.
         * @type {Function}
         */
        this.onOpen = onOpen;

        /**
         * A function to call when the context menu is closed.
         * @type {Function}
         */
        this.onClose = onClose;

        /**
         * Track which direction the menu is expanded in
         * @type {boolean}
         */
        this._expandUp = false;

        // Bind to the current element
        this.bind();
    }

    /**
     * The parent HTML element to which the context menu is attached
     * @type {HTMLElement}
     */
    #target;

    /* -------------------------------------------- */

    /**
     * A convenience accessor to the context menu HTML object
     * @returns {*|jQuery.fn.init|jQuery|HTMLElement}
     */
    get menu() {
        return $("#context-menu");
    }

    /* -------------------------------------------- */

    /**
     * Create a ContextMenu for this Application and dispatch hooks.
     * @param {Application} app                           The Application this ContextMenu belongs to.
     * @param {jQuery} html                               The Application's rendered HTML.
     * @param {string} selector                           The target CSS selector which activates the menu.
     * @param {ContextMenuEntry[]} menuItems              The array of menu items being rendered.
     * @param {object} [options]                          Additional options to configure context menu initialization.
     * @param {string} [options.hookName="EntryContext"]  The name of the hook to call.
     * @returns {ContextMenu}
     */
    static create(app, html, selector, menuItems, {hookName="EntryContext", ...options}={}) {
        for ( const cls of app.constructor._getInheritanceChain() ) {
            /**
             * A hook event that fires when the context menu for entries in an Application is constructed. Substitute the
             * Application name in the hook event to target a specific Application, for example
             * "getActorDirectoryEntryContext".
             * @function getApplicationEntryContext
             * @memberof hookEvents
             * @param {jQuery} html                     The HTML element to which the context options are attached
             * @param {ContextMenuEntry[]} entryOptions The context menu entries
             */
            Hooks.call(`get${cls.name}${hookName}`, html, menuItems);
        }

        if ( menuItems ) return new ContextMenu(html, selector, menuItems, options);
    }

    /* -------------------------------------------- */

    /**
     * Attach a ContextMenu instance to an HTML selector
     */
    bind() {
        this.element.on(this.eventName, this.selector, event => {
            event.preventDefault();
            this.#target = event.currentTarget;
            const menu = this.menu;

            // Remove existing context UI
            const prior = document.querySelector(".context");
            prior?.classList.remove("context");
            if ( this.#target.contains(menu[0]) ) return this.close();

            // Render a new context menu
            event.stopPropagation();
            ui.context = this;
            this.onOpen?.(this.#target);
            return this.render($(this.#target));
        });
    }

    /* -------------------------------------------- */

    /**
     * Closes the menu and removes it from the DOM.
     * @param {object} [options]                Options to configure the closing behavior.
     * @param {boolean} [options.animate=true]  Animate the context menu closing.
     * @returns {Promise<void>}
     */
    async close({animate=true}={}) {
        if ( animate ) await this._animateClose(this.menu);
        this._close();
    }

    /* -------------------------------------------- */

    _close() {
        for ( const item of this.menuItems ) {
            delete item.element;
        }
        this.menu.remove();
        $(".context").removeClass("context");
        delete ui.context;
        this.onClose?.(this.#target);
    }

    /* -------------------------------------------- */

    async _animateOpen(menu) {
        menu.hide();
        return new Promise(resolve => menu.slideDown(200, resolve));
    }

    /* -------------------------------------------- */

    async _animateClose(menu) {
        return new Promise(resolve => menu.slideUp(200, resolve));
    }

    /* -------------------------------------------- */

    /**
     * Render the Context Menu by iterating over the menuItems it contains.
     * Check the visibility of each menu item, and only render ones which are allowed by the item's logical condition.
     * Attach a click handler to each item which is rendered.
     * @param {jQuery} target     The target element to which the context menu is attached
     */
    render(target) {
        const existing = $("#context-menu");
        let html = existing.length ? existing : $('<nav id="context-menu"></nav>');
        let ol = $('<ol class="context-items"></ol>');
        html.html(ol);

        // Build menu items
        for (let item of this.menuItems) {

            // Determine menu item visibility (display unless false)
            let display = true;
            if ( item.condition !== undefined ) {
                display = ( item.condition instanceof Function ) ? item.condition(target) : item.condition;
            }
            if ( !display ) continue;

            // Construct and add the menu item
            let name = game.i18n.localize(item.name);
            let li = $(`<li class="context-item">${item.icon}${name}</li>`);
            li.children("i").addClass("fa-fw");
            ol.append(li);

            // Record a reference to the item
            item.element = li[0];
        }

        // Bail out if there are no children
        if ( ol.children().length === 0 ) return;

        // Append to target
        this._setPosition(html, target);

        // Apply interactivity
        this.activateListeners(html);

        // Deactivate global tooltip
        game.tooltip.deactivate();

        // Animate open the menu
        return this._animateOpen(html);
    }

    /* -------------------------------------------- */

    /**
     * Set the position of the context menu, taking into consideration whether the menu should expand upward or downward
     * @private
     */
    _setPosition(html, target) {
        const container = target[0].parentElement;
        let sheet = undefined;
        let testContainer = target[0].parentElement;
        while (testContainer) {
            testContainer = testContainer.parentElement;
            if (testContainer.classList.contains("sheet")) {
                sheet = testContainer;
                break;
            }
        }

        // Append to target and get the context bounds
        target.css("position", "relative");
        html.css("visibility", "hidden");
        target.append(html);
        const contextRect = html[0].getBoundingClientRect();
        const parentRect = target[0].getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const sheetRect = sheet ? sheet.getBoundingClientRect() : undefined;

        // Determine whether to expand upwards
        const contextTop = parentRect.top - contextRect.height;
        const contextBottom = parentRect.bottom + contextRect.height;
        const canOverflowUp = (contextTop > containerRect.top) || (getComputedStyle(container).overflowY === "visible");

        // If it overflows the container bottom, but not the container top
        const containerUp = ( contextBottom > containerRect.bottom ) && ( contextTop >= containerRect.top );
        const windowUp = ( contextBottom > (sheet ? sheetRect.bottom : window.innerHeight) ) && ( contextTop > 0 ) && canOverflowUp;
        this._expandUp = containerUp || windowUp;
        
        const contextLeft = parentRect.right - contextRect.width;
        const contextRight = parentRect.left + contextRect.width;
        const canOverflowLeft = (contextLeft < containerRect.left) || (getComputedStyle(container).overflowX === "visible");
        
        const containerLeft = (contextRight > containerRect.right) && (contextLeft >= containerRect.left);
        const windowLeft = (contextRight > (sheet ? sheetRect.right : window.innerWidth)) && (contextLeft > 0) && canOverflowLeft;
        console.log(contextBottom + " - " + sheetRect.width + " - " + canOverflowUp);
        this._expandLeft = containerLeft || windowLeft;

        // Display the menu
        html.removeClass("expand-up");
        html.removeClass("expand-down");
        html.removeClass("expand-left");
        html.removeClass("expand-right");
        
        html.addClass((this._expandUp ? "expand-up" : "expand-down") + (this._expandLeft ? " expand-left" : " expand-right") );
        html.css("visibility", "");
        target.addClass("context");
    }

    /* -------------------------------------------- */

    /**
     * Local listeners which apply to each ContextMenu instance which is created.
     * @param {jQuery} html
     */
    activateListeners(html) {
        html.on("click", "li.context-item", this.#onClickItem.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle click events on context menu items.
     * @param {PointerEvent} event      The click event
     */
    #onClickItem(event) {
        event.preventDefault();
        event.stopPropagation();
        const li = event.currentTarget;
        const item = this.menuItems.find(i => i.element === li);
        item?.callback($(this.#target));
        this.close();
    }

    /* -------------------------------------------- */

    /**
     * Global listeners which apply once only to the document.
     */
    static eventListeners() {
        document.addEventListener("click", ev => {
            if ( ui.context ) ui.context.close();
        });
    }
}

/* -------------------------------------------- */
