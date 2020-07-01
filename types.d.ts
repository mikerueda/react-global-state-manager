// TODO Somehow make this more readable
export type Reducer<S> = (s: S, ...params: any[]) => S;

export type Reducers<S> = { [action: string]: Reducer<S>; };

export type ReducerPayload<R extends Reducer<any>> = R extends (_: any, ...args: infer P) => any ? P : never;

export type ActionCreator<S, R extends Reducer<S>> = (...params: ReducerPayload<R>) => Promise<S>;

export type ActionCreators<S, T extends Reducers<S>> = { [P in keyof T]: ActionCreator<S, T[P]>; };

export type ActionName<S, R extends Reducers<S>> = keyof R;

export type ActionPayload<S, R extends Reducers<S>> = ReducerPayload<R[keyof R]>;

export interface Action<S, R extends Reducers<S>> {
    name: ActionName<S, R>;
    payload: ActionPayload<S, R>;
    resolve: (value?: S | PromiseLike<S>) => void;
}
