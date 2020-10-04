import { ArcAction } from './ArcAction';

/**
 * Values for the condition source
 * @type string
 */
export enum ActionTypeEnum {
  /**
   * The action is relates to a request object
   */
  request = 'request',
  /**
   * The action is relates to a response object
   */
  response = 'response',
}

/**
 * Values for the condition source
 * @type string
 */
export enum ConditionSourceEnum {
  /**
   * The source is the URL.
   */
  url = 'url',
  /**
   * The source is the status code.
   * This should only be used when the source object is ARC Response
   */
  statuscode = 'statuscode',
  /**
   * The source is the headers.
   */
  headers = 'headers',
  /**
   * The source is the payload.
   */
  body = 'body',
  /**
   * The source is specified by the user value.
   */
  value = 'value',
}

export interface ActionConditionViewOptions {
  /**
   * Whether the condition editor is rendered in the "full" view
   * instead of the summary.
   */
  opened?: boolean;
}

/**
 * Definition for a condition that contains actions.
 */
export interface ConditionSchema {
  /**
   * The condition is either request or response related.
   */
  type: string;
  /**
   * The source of the data.
   * The type of the data source (request or response) depends on
   * the context at which the condition runs.
   */
  source?: string;
  /**
   * The value to compare to.
   * Usually it is a string. For `statuscode` acceptable value is a number.
   */
  value?: string|number;
  /**
   * The comparison operator.
   */
  operator?: string;
  /**
   * Path to the data to extract the value to test the condition.
   * Only relevant for some `source` options.
   */
  path?: string;
  /**
   * Whether the condition always pass.
   * The condition is not really checked, values can be empty. The condition
   * check always returns `true`.
   */
  alwaysPass: boolean;
  /**
   * Options related to the UI state in the application.
   */
  view?: ActionConditionViewOptions;
}

/**
 * Definition of options for the `ArcActions` class.
 */
export interface ArcActionsOptions {
  /**
   * List of action added to the condition.
   */
  actions?: ArcAction[];
  /**
   * Whether the condition and therefore actions are enabled.
   */
  enabled?: boolean;
}

export type OperatorEnum = "equal" | "not-equal" | "greater-than" | "greater-than-equal" | "less-than" | "less-than-equal" | "contains" | "regex";
export type RequestDataSourceEnum = "request.url" | "request.method" | "request.headers" | "request.body";
export type ResponseDataSourceEnum = "response.url" | "response.method" | "response.headers" | "response.body";

export declare interface IteratorConfiguration {
  /**
   * The path to the property to use in the comparison.
   */
  path: string;
  /**
   * The value of the condition.
   */
  condition: string;
  /**
   * The comparison operator.
   */
  operator: OperatorEnum;
}

export declare interface DataSourceConfiguration {
  /**
   * Source of the data.
   */
  source: RequestDataSourceEnum|ResponseDataSourceEnum;
  /**
   * When set the iterator configuration is enabled
   */
  iteratorEnabled?: boolean;
  /**
   * Array search configuration.
   */
  iterator?: IteratorConfiguration;
  /**
   * The path to the data. When `iteratorEnabled` is set then this
   * is a path counting from an array item. When not set an entire value of `source` is used.
   */
  path?: string;
}

export declare interface SetCookieConfig {
  /**
   * Name of the cookie
   */
  name: string;
  /**
   * Source of the cookie value
   */
  source: DataSourceConfiguration;
  /**
   * When set it uses request URL instead of defined URL in the action
   */
  useRequestUrl?: boolean;
  /**
   * An URL associated with the cookie
   */
  url?: string;
  /**
   * The cookie expiration time
   */
  expires?: string;
  /**
   * Whether the cookie is host only
   */
  hostOnly?: boolean;
  /**
   * Whether the cookie is HTTP only
   */
  httpOnly?: boolean;
  /**
   * Whether the cookie is HTTPS only
   */
  secure?: boolean;
  /**
   * Whether the cookie is a session cookie
   */
  session?: boolean;
}

export declare interface SetVariableConfig {
  /**
   * Name of the variable to set
   */
  name: string;
  /**
   * Source of the cookie value
   */
  source: DataSourceConfiguration;
}

export declare interface DeleteCookieConfig {
  /**
   * When set it uses request URL instead of defined URL in the action.
   */
  useRequestUrl?: boolean;
  /**
   * An URL associated with the cookie.
   * Only used when `useRequestUrl` is not `true`.
   */
  url?: string;
  /**
   * When set it removes all cookies associated wit the URL.
   */
  removeAll?: boolean;
  /**
   * Name of the cookie to remove.
   */
  name?: string;
}

/**
 * Convenience type that gathers all configurations in one type.
 */
export type ActionConfiguration = SetCookieConfig | SetVariableConfig | DeleteCookieConfig;

/**
 * An UI controlling configuration for an action.
 */
export declare interface ArcActionViewConfiguration {
  /**
   * Whether the action is "opened" in the editor UI.
   */
  opened?: boolean;
}

export type TypeEnum = "request" | "response";

/**
 * An enum representing a list of supported in this runner/editor actions.
 */
export type SupportedActions = "set-variable" | "set-cookie" | "delete-cookie";

/**
 * ARC Action configuration object.
 */
export declare interface ArcActionConfiguration {
  /**
   * Type of the action.
   * Can be either `request` or `response`. Default to request.
   */
  type: string;
  /**
   * Action name. Default to `null` which is an unknown action.
   */
  name?: string;
  /**
   * Whether the action is enabled. `false` by default.
   */
  enabled?: boolean;
  /**
   * Execution priority.
   */
  priority?: number;
  /**
   * Action configuration. Might be an empty object but it's required.
   */
  config?: ActionConfiguration;
  /**
   * Whether or not the action is executed synchronously.
   */
  sync?: boolean;
  /**
   * Whether the request will fail when the action fails.
   */
  failOnError?: boolean;
  /**
   * View configuration unrelated to action logic.
   */
  view?: ArcActionViewConfiguration;
}