/* eslint-disable class-methods-use-this */
import { VariablesProcessor } from '@advanced-rest-client/arc-environment';
import { ArcModelEvents } from '@advanced-rest-client/arc-models';
import { mapRunnables } from '../ActionCondition.js';
import { mapActions, sortActions } from '../ArcAction.js';
import { ActionRunner } from './ActionRunner.js';

/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */

/** @typedef {import('../ArcAction').ArcAction} ArcAction */
/** @typedef {import('../types').ActionsRunnerInit} ActionsRunnerInit */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.ArcEditorRequest} ArcEditorRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.TransportRequest} TransportRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.Response} Response */
/** @typedef {import('@advanced-rest-client/arc-types').ArcResponse.ErrorResponse} ErrorResponse */
/** @typedef {import('@advanced-rest-client/arc-types').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/arc-models').ARCVariable} ARCVariable */

/**
 * The main class that executes actions for a request and a response in Advanced REST Client.
 */
export class ActionsRunner {
  /**
   * @param {ActionsRunnerInit} config Configuration options
   */
  constructor(config) {
    const { jexl, eventsTarget } = config;
    this.jexl = jexl;
    this.eventsTarget = eventsTarget;
  }

  /**
   * Refreshes information about all environments.
   * 
   * @returns {Promise<ARCVariable[]>} Resolved when the environments are refreshed and update is complete.
   */
  async readVariables() {
    const record = await ArcModelEvents.Environment.current(this.eventsTarget);
    const { variables } = record;
    return variables;
  }

  /**
   * Takes the ARC editor request object and runs the request actions added to it.
   * 
   * Note, actions are executed one-by-one in order defined by the `priority` property. The final request object may be changed.
   * 
   * @param {ArcEditorRequest} request ARC request object generated by the request editor.
   * @return {Promise<ArcEditorRequest>} Promise resolved to the passed request object. It may be a copy.
   * @throws {Error} When required arguments are not set.
   */
  async processRequestActions(request) {
    if (!request) {
      throw new Error('Expected an argument.');
    }
    const { actions } = request.request;
    if (!actions) {
      return request;
    }
    const requestActions = actions.request;
    if (!Array.isArray(requestActions)) {
      return request;
    }
    const enabled = requestActions.filter((item) => !!item.enabled && !!item.actions && !!item.actions.length);
    if (!enabled.length) {
      return request;
    }
    const runnables = mapRunnables(enabled);
    const variables = await this.readVariables();
    const processor = new VariablesProcessor(this.jexl, variables);
    for (let i = 0, len = runnables.length; i < len; i++) {
      const runnable = runnables[i];
      if (!runnable.satisfied(request.request)) {
        continue;
      }
      const execs = mapActions(runnable.actions).filter((item) => !!item.enabled);
      execs.sort(sortActions);
      for (let j = 0, eLen = execs.length; j < eLen; j++) {
        const action = await this.evaluateAction(execs[j], processor);
        const runner = new ActionRunner(action, this.eventsTarget, {
          request: request.request,
        });
        if (action.sync === false) {
          this.runAsynchronousAction(runner);
          continue;
        }
        try {
          await runner.run();
        } catch (e) {
          if (action.failOnError) {
            throw e;
          }
        }
      }
    }
    return request;
  }

  /**
   * Runs asynchronous action
   * @param {ActionRunner} runner 
   */
  async runAsynchronousAction(runner) {
    try {
      await runner.run();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.info(`Asynchronous action resulted in error`, e);
    }
  }

  /**
   * Processes actions when response object is ready.
   * 
   * @param {ArcEditorRequest} request ARC request object generated by the request editor.
   * @param {TransportRequest} executed The request reported by the transport library
   * @param {Response|ErrorResponse} response ARC response object.
   * @returns {Promise<void>} A promise resolved when actions were performed.
   */
  async processResponseActions(request, executed, response) {
    if (!request || !executed || !response) {
      throw new Error('Expected 3 arguments.');
    }
    const { actions } = request.request;
    if (!actions) {
      return;
    }
    const responseActions = actions.response;
    if (!Array.isArray(responseActions)) {
      return;
    }
    const enabled = responseActions.filter((item) => !!item.enabled && !!item.actions && !!item.actions.length);
    if (!enabled.length) {
      return;
    }
    const runnables = mapRunnables(enabled);
    const variables = await this.readVariables();
    const processor = new VariablesProcessor(this.jexl, variables);
    for (let i = 0, len = runnables.length; i < len; i++) {
      const runnable = runnables[i];
      if (!runnable.satisfied(request.request, executed, response)) {
        continue;
      }
      const execs = mapActions(runnable.actions).filter((item) => !!item.enabled);
      execs.sort(sortActions);
      for (let j = 0, eLen = execs.length; j < eLen; j++) {
        const action = await this.evaluateAction(execs[j], processor);
        const runner = new ActionRunner(action, this.eventsTarget, {
          request: request.request,
          executedRequest: executed,
          response,
        });
        if (action.sync === false) {
          this.runAsynchronousAction(runner);
          continue;
        }
        try {
          await runner.run();
        } catch (e) {
          if (action.failOnError) {
            throw e;
          }
        }
      }
    }
  }

  /**
   * Evaluates variables in the action.
   * @param {ArcAction} action An action to evaluate.
   * @param {VariablesProcessor} processor Initialized variables processor with the current environment
   * @return {Promise<ArcAction>} Resolved to an action without variables.
   */
  async evaluateAction(action, processor) {
    const copy = action.clone();
    const { config } = copy;
    // @ts-ignore
    await processor.evaluateVariables(config);
    const { source } = /** @type any */ (config);
    if (source) {
      await processor.evaluateVariables(source);
    }
    if (source && source.iterator) {
      await processor.evaluateVariables(source.iterator);
    }
    return copy;
  }
}
