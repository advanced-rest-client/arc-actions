import { LitElement, html } from 'lit-element';
import styles from './styles/ActionEditor.styles.js';
import tooltipStyles from './styles/Tooltip.styles.js';
import { actionNamesMap } from './Utils.js';
import setCookieTemplate from './EditorMixins/SetCookieTemplate.js';
import setVariableTemplate from './EditorMixins/SetVariableTemplate.js';
import deleteCookieTemplate from './EditorMixins/DeleteCookieTemplate.js';
import {
  notifyChange,
  inputHandler,
  configChangeHandler,
  dataSourceHandler,
  actionHelpTpl,
  updateDeepProperty,
  enabledHandler,
  deleteHandler,
  duplicateHandler,
  closeHandler,
  openedHandler,
  helpHandler,
  openedCardTemplate,
  closedCardTemplate,
  openedCardTitle,
  openedCardFooter,
  openButtonTemplate,
  enableSwitchTemplate,
  deleteButtonTemplate,
  duplicateButtonTemplate,
  closeButtonTemplate,
} from './internals.js';

const configProperty = 'config';

const helpBase = 'https://docs.advancedrestclient.com/arc-actions/';
const helpMap = {
  'set-cookie': `${helpBase}introduction/set-cookie-action`,
  'set-variable': `${helpBase}introduction/set-variable-action`,
  'delete-cookie': `${helpBase}introduction/remove-cookie-s-action`,
};

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('./types').DataSourceConfiguration} DataSourceConfiguration */
/** @typedef {import('./types').IteratorConfiguration} IteratorConfiguration */
/** @typedef {import('./types').SetCookieConfig} SetCookieConfig */
/** @typedef {import('./types').DeleteCookieConfig} DeleteCookieConfig */
/** @typedef {import('./types').SetVariableConfig} SetVariableConfig */
/** @typedef {import('./types').ActionConfiguration} ActionConfiguration */

/**
 * @param {string} name
 * @return {TemplateResult|string} Template for the title when the action is closed.
 */
const closedCardTitleTemplate = (name) => {
  const label = actionNamesMap(name);
  return html` <div class="action-title">${label}</div> `;
};

export class ARCActionEditorElement extends LitElement {
  static get styles() {
    return [styles, tooltipStyles];
  }

  static get properties() {
    return {
      /**
       * Action name that determines which editor to load.
       * The name mast be one of the supported action types or otherwise the
       * component won't render any editor.
       */
      name: { type: String, reflect: true },
      /**
       * Either `request` or `response`. Actions without a type are not
       * executed.
       */
      type: { type: String, reflect: true },
      /**
       * Whether the action is enabled. An action is considered enabled when
       * this value equals `true`.
       */
      enabled: { type: Boolean, reflect: true },
      /**
       * Whether the action should be called synchronously to the request or
       * the response.
       * This value is optional and default to `true`.
       *
       * @default true
       */
      sync: { type: Boolean, reflect: true },
      /**
       * Whether the action should fail when
       * the request / response if it results in error.
       */
      failOnError: { type: Boolean, reflect: true },
      /**
       * Action's priority on a scale of 1 to 10. The default value is 5 and
       * this property is optional.
       *
       * @default 5
       */
      priority: { type: Number, reflect: true },
      /**
       * The configuration of an action. The type depends on the `name` property.
       */
      config: { type: Object },

      /**
       * Whether or not the action is rendered in full view.
       */
      opened: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with the Anypoint theme
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * Enables outlined MD theme
       */
      outlined: { type: Boolean, reflect: true },
      readOnly: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.compatibility = false;
    this.outlined = false;
    this.opened = false;
    this.priority = 5;
    this.failOnError = false;
    this.readOnly = false;
    this.disabled = false;
    this.name = undefined;
    this.type = undefined;
    this.config = undefined;
  }

  /**
   * Dispatches the `change` event with the name of the property that changed.
   * @param {string} prop Name of changed property.
   */
  [notifyChange](prop) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          prop,
        },
      })
    );
  }

  /**
   * A handler for the
   * @param {Event} e
   */
  [inputHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const { name, value } = targetElement;
    this[updateDeepProperty](name, value);
    const { notify } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
  }

  /**
   * A handler for checkbox / switch change event for the action configuration.
   * @param {Event} e
   */
  [configChangeHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const { name, checked } = targetElement;
    this[updateDeepProperty](name, checked);
    const { notify, render } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
    if (render) {
      this.requestUpdate();
    }
  }

  /**
   * A handler for the data source selector for action configuration.
   * @param {Event} e
   */
  [dataSourceHandler](e) {
    const { target } = e;
    const targetElement = /** @type {HTMLInputElement} */ (target);
    const parent = /** @type {HTMLFormElement} */ (targetElement.parentElement);
    const { name } = parent;
    // @ts-ignore
    const value = targetElement.selected;
    this[updateDeepProperty](name, value);
    this[notifyChange](configProperty);
    const { notify, render } = targetElement.dataset;
    if (notify) {
      this[notifyChange](notify);
    }
    if (render) {
      this.requestUpdate();
    }
  }

  /**
   * Updates a property value for given path. The path may contain `.` to
   * enter sub properties.
   *
   * For example, to set a top level property use the property name.
   *
   * ```
   * this[updateDeepProperty]('priority', 10);
   * ```
   *
   * To change an object property separate names with a dot:
   *
   * ```
   * this[updateDeepProperty]('config.enabled', true);
   * ```
   *
   * This function builds the path if it doesn't exist.
   *
   * @param {string} name
   * @param {string|boolean} value
   */
  [updateDeepProperty](name, value) {
    let tmp = this;
    let last = '';
    String(name)
      .split('.')
      .forEach((item, index, arr) => {
        if (arr.length === index + 1) {
          last = item;
          return;
        }
        if (!tmp[item]) {
          tmp[item] = {};
        }
        tmp = tmp[item];
      });
    tmp[last] = value;
  }

  /**
   * A handler for the action enable switch.
   * @param {Event} e
   */
  [enabledHandler](e) {
    this.enabled = /** @type {HTMLInputElement} */ (e.target).checked;
    this[notifyChange]('enabled');
  }

  /**
   * A handler for the delete action button click. Dispatches the `remove`
   * custom event.
   */
  [deleteHandler]() {
    this.dispatchEvent(new CustomEvent('remove'));
  }

  /**
   * A handler for the duplicate action button click. Dispatches the `duplicate`
   * custom event.
   */
  [duplicateHandler]() {
    this.dispatchEvent(new CustomEvent('duplicate'));
  }

  /**
   * A handler for the close action button click. Updates the `opened` value
   * on the `view` property.
   */
  [closeHandler]() {
    this.opened = false;
    this[notifyChange]('view.opened');
  }

  /**
   * A handler for the open action button click. Updates the `opened` value
   * on the `view` property.
   */
  [openedHandler]() {
    this.opened = true;
    this[notifyChange]('view.opened');
  }

  /**
   * A handler for the help button click.
   * It dispatches used by ARC `open-external-url` to use platform's APIs to
   * open a popup. As a fallback it uses `window.open`.
   *
   * @param {Event} e
   * @return {Window|null} Returns created window if `window.open` was called.
   */
  [helpHandler](e) {
    const { url } = /** @type {HTMLInputElement} */ (e.target).dataset;
    const ev = new CustomEvent('open-external-url', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        url,
      },
    });
    this.dispatchEvent(ev);
    if (ev.defaultPrevented) {
      return null;
    }
    return window.open(url);
  }

  /**
   * Main render function
   * @return {TemplateResult}
   */
  render() {
    const { opened = false } = this;
    return html`
      <section class="action-card">
        ${opened ? this[openedCardTemplate]() : this[closedCardTemplate]()}
      </section>
    `;
  }

  /**
   * @return {TemplateResult} Template for opened action view.
   */
  [openedCardTemplate]() {
    const {
      name = '',
      type,
      failOnError,
      config,
      outlined,
      compatibility,
      readOnly,
      disabled,
    } = this;
    const lowerName = String(name).toLowerCase();
    const changeHandler = this[configChangeHandler];
    const inputConfig = {
      outlined,
      compatibility,
      readOnly,
      disabled,
    };
    let content;
    switch (lowerName) {
      case 'set-cookie':
        content = setCookieTemplate(
          failOnError,
          config,
          type,
          this[inputHandler],
          changeHandler,
          this[dataSourceHandler],
          inputConfig
        );
        break;
      case 'set-variable':
        content = setVariableTemplate(
          failOnError,
          config,
          type,
          this[inputHandler],
          changeHandler,
          this[dataSourceHandler],
          inputConfig
        );
        break;
      case 'delete-cookie':
        content = deleteCookieTemplate(
          config,
          this[inputHandler],
          changeHandler,
          inputConfig
        );
        break;
      default:
        return html``;
    }
    return html`
      ${this[openedCardTitle](name)} ${content} ${this[openedCardFooter]()}
    `;
  }

  /**
   * @return {TemplateResult} Template for closed action view.
   */
  [closedCardTemplate]() {
    const { name = '' } = this;
    const lowerName = String(name).toLowerCase();
    return html`
      <div class="closed-title">
        ${closedCardTitleTemplate(lowerName)} ${this[openButtonTemplate]()}
      </div>
    `;
  }

  /**
   * @param {string} name Action's name
   * @return {TemplateResult} Template for opened action's title.
   */
  [openedCardTitle](name) {
    const label = actionNamesMap(name);
    const helpUrl = helpMap[name];
    return html`
      <div class="opened-title">
        <div class="action-title">${label}</div>
        ${this[actionHelpTpl](helpUrl)}
      </div>
    `;
  }

  /**
   * @return {TemplateResult} Template for opened action's footer line.
   */
  [openedCardFooter]() {
    return html`
      <div class="action-footer">
        ${this[enableSwitchTemplate]()} ${this[deleteButtonTemplate]()}
        ${this[duplicateButtonTemplate]()} ${this[closeButtonTemplate]()}
      </div>
    `;
  }

  /**
   * @param {string} url The URL to use to render the action.
   * @return {TemplateResult|string} Template for the help button.
   */
  [actionHelpTpl](url) {
    if (!url) {
      return '';
    }
    return html`
      <anypoint-button
        class="action-help"
        data-url="${url}"
        @click="${this[helpHandler]}"
        >Help</anypoint-button
      >
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the help button.
   */
  [enableSwitchTemplate]() {
    const { compatibility, enabled } = this;
    return html`
      <anypoint-switch
        ?compatibility="${compatibility}"
        .checked="${enabled}"
        @change="${this[enabledHandler]}"
        >Enabled</anypoint-switch
      >
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the delete button.
   */
  [deleteButtonTemplate]() {
    const { compatibility } = this;
    return html`
      <anypoint-button
        title="Removes this action"
        class="action-delete"
        ?compatibility="${compatibility}"
        @click="${this[deleteHandler]}"
        >Delete</anypoint-button
      >
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the duplicate button.
   */
  [duplicateButtonTemplate]() {
    const { compatibility } = this;
    return html`
      <anypoint-button
        title="Duplicates this action"
        ?compatibility="${compatibility}"
        @click="${this[duplicateHandler]}"
        >Duplicate</anypoint-button
      >
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the close action button.
   */
  [closeButtonTemplate]() {
    const { compatibility } = this;
    return html`
      <anypoint-button
        title="Closes the editor"
        ?compatibility="${compatibility}"
        @click="${this[closeHandler]}"
        >Close</anypoint-button
      >
    `;
  }

  /**
   * @return {TemplateResult|string} Template for the open action button.
   */
  [openButtonTemplate]() {
    const { compatibility } = this;
    return html`
      <anypoint-button
        title="Opens the editor"
        class="action-open"
        ?compatibility="${compatibility}"
        @click="${this[openedHandler]}"
        >Open</anypoint-button
      >
    `;
  }
}