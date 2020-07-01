import { createStore, StoreOptions } from "./base";
import { Reducers } from "./types";

interface PersistentOptions<S> extends StoreOptions {
    initialize: () => S;
    handleChange: (prev: S, next: S) => void;
}

export const createPersistentStore = <S, R extends Reducers<S>>(reducers: R, { handleChange, initialize, ...baseOptions }: PersistentOptions<S>) => {
    let prevStore = initialize();
    const Store = createStore(prevStore, reducers, baseOptions);
    Store.subscribe((nextStore) => handleChange(prevStore, prevStore = nextStore));
    return Store;
};