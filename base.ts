import React from "react";
import { Action, ActionCreators, ActionName, ActionPayload, Reducers } from "./types";
import { hasChanged, defer, logAction, log } from "./tools";

// TODO fix definition of Object.keys()
const keys: <T>(obj: T) => Array<Extract<keyof T, string>> = Object.keys;

export interface StoreOptions {
    name: string;
    log?: boolean
}

type Updater<S> = (store: S) => void;

export const createStore = <S extends {}, R extends Reducers<S>>(defaultStorage: S, reducers: R, storeConfig: StoreOptions) => {
    // ↓↓↓ MUTABLE VARIABLE ↓↓↓
    let store = defaultStorage;
    // ↑↑↑ MUTABLE VARIABLE ↑↑↑

    const { name: storeName, log: logActions} = storeConfig;
    
    const subscribers = new Set<Updater<S>>();
    const actionStack = [];

    const setState = (nextStore) => store = nextStore;

    const notifyUpdate = () => Array.from(subscribers).forEach((updater) => updater(store))

    const performAction = log(
        (prevStore: S, action:Action<S, R>) => reducers[action.name](prevStore, ...action.payload),
        logActions ? logAction(storeName) : null
    );

    const resolveActions = ({ resolve }: Action<S, R>) => resolve(store);

    const processActions = defer(() => {
        const nextStore = actionStack.reduce(performAction, store);
        // GET RID OF THIS IF, FIND SOME WAY TO DO IT, OR SOME KITTIES WILL DIE
        if (hasChanged(store, nextStore)) {
            setState(nextStore);
            notifyUpdate();
        }
        actionStack.forEach(resolveActions);
        actionStack.splice(0); // Clear Stack;
    });

    const enqueue = (action: Action<S, R>) => {
        actionStack.push(action);
        processActions();
    };

    const bindActions = (acc: ActionCreators<S, R>, name: ActionName<S, R>): ActionCreators<S, R> => {
        const asyncAction = (...payload: ActionPayload<S, R>) => new Promise<S>((resolve) => enqueue({ name, payload, resolve }))
        return ({ ...acc, [name]: asyncAction })
    };

    const actions = keys(reducers).reduce<ActionCreators<S, R>>(bindActions, {} as any);

    const getStore = () => store;

    const subscribe = (handler: (store: S) => void) => {
        subscribers.add(handler);
        return () => subscribers.delete(handler);
    };

    const useStore = (): [S, ActionCreators<S, R>] => {
        const [currentStore, updater] = React.useState<S>(getStore());
        React.useEffect(() => subscribe(updater), []);
        return [currentStore, actions];
    }

    const Context = React.createContext<[S, ActionCreators<S, R>]>([store, actions]);

    const Provider: React.FunctionComponent = ({ children }) => {
        return React.createElement(Context.Provider, { value: useStore() }, children)
    }

    return ({
        Context,
        Provider,
        actions,
        getStore,
        subscribe,
        useStore,
    })
};