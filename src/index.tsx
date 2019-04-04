import React from 'react';

type StateInitial<T> = {
  isPending: false;
  promise: null;
  result: null;
  error: null;
};
type StatePending<T> = {
  isPending: true;
  promise: Promise<T>;
  result: null;
  error: null;
};
type StateFulfilled<T> = {
  isPending: false;
  promise: Promise<T> | null;
  result: T;
  error: null;
};
type StateError<T> = {
  isPending: false;
  promise: Promise<T> | null;
  result: null;
  error: T;
};
type StatePending2<T> = {
  isPending: true;
  promise: Promise<T>;
  result: T;
  error: null;
};
type StatePending3<T> = {
  isPending: true;
  promise: Promise<T>;
  result: null;
  error: T;
};

type State<T> =
  | StateInitial<T>
  | StatePending<T>
  | StatePending2<T>
  | StatePending3<T>
  | StateFulfilled<T>
  | StateError<T>;

type RenderProps<T> =
  | {
      isPending: false;
      result: undefined;
      error: null;
    }
  | {
      isPending: true;
      result: undefined;
      error: null;
    }
  | {
      isPending: false;
      result: T;
      error: null;
    }
  | {
      isPending: false;
      result: undefined;
      error: T;
    }
  | {
      isPending: false;
      result: T;
      error: T;
    }
  | {
      isPending: true;
      result: T;
      error: null;
    }
  | {
      isPending: true;
      result: undefined;
      error: T;
    };

interface Props<T> {
  promise: Promise<T> | null;
  children: (p: RenderProps<T>) => React.ReactNode;
  onFulfilled?: ({ result: T }) => undefined;
}

export class Promiser<T> extends React.Component<Props<T>, State<T>> {
  // // @ts-ignore
  // constructor(...args) {
  //   // @ts-ignore
  //   super(...args);

  //   this.state = {
  //     isPending: this.props.promise != null,
  //     result: null,
  //     error: null,

  //     promise: null
  //   };
  // }

  state: State<T> =
    this.props.promise == null
      ? {
          isPending: false,
          result: null,
          error: null,

          promise: this.props.promise
        }
      : {
          isPending: true,
          result: null,
          error: null,

          promise: this.props.promise
        };

  stop?: boolean;

  static getDerivedStateFromProps<T>(props: Props<T>, state: State<T>) {
    if (props.promise === state.promise) return null;
    return {
      promise: props.promise,
      isPending: true
    };
  }

  componentDidMount() {
    this.subscribeToPromise(this.props.promise);
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (this.props.promise !== prevProps.promise) {
      this.subscribeToPromise(this.props.promise);
    }
  }

  componentWillUnmount() {
    this.stop = true;
  }

  subscribeToPromise(promise: Promise<T> | null) {
    if (promise == null) {
      return this.setState({
        isPending: false,
        result: null,
        error: null
      });
    }

    promise.then(
      result => {
        if (this.stop || promise !== this.props.promise) return;

        return this.props.onFulfilled != null
          ? Promise.resolve()
              .then(
                () =>
                  this.props.onFulfilled != null &&
                  this.props.onFulfilled({ result })
              )
              .then(() =>
                this.setState({
                  isPending: false,
                  result,
                  error: null
                })
              )
          : this.setState({
              isPending: false,
              result,
              error: null
            });
      },
      error => {
        if (this.stop || promise !== this.props.promise) return;

        return this.setState({
          isPending: false,
          result: null,
          error
        });
      }
    );
  }

  render() {
    // if (this.state.isPending) {
    //   if (this.state.result == null) {
    //     if (this.state.error == null) {
    //       return this.props.children({
    //         isPending: true,
    //         result: undefined,
    //         error: null
    //       });
    //     } else {
    //       return this.props.children({
    //         isPending: true,
    //         result: undefined,
    //         error: this.state.error
    //       });
    //     }
    //   } else {
    //     return this.props.children({
    //       isPending: true,
    //       result: this.state.result,
    //       error: null
    //     });
    //   }
    // } else {
    //   if (this.state.result == null) {
    //     if (this.state.error == null) {
    //       return this.props.children({
    //         isPending: false,
    //         result: undefined,
    //         error: null
    //       });
    //     } else {
    //       return this.props.children({
    //         isPending: false,
    //         result: undefined,
    //         error: this.state.error
    //       });
    //     }
    //   } else {
    //     if (this.state.error == null) {
    //       return this.props.children({
    //         isPending: false,
    //         result: this.state.result,
    //         error: null
    //       });
    //     } else {
    //       return this.props.children({
    //         isPending: false,
    //         result: this.state.result,
    //         error: this.state.error
    //       });
    //     }
    //   }
    // }

    return this.props.children(
      this.state.isPending
        ? {
            isPending: true,
            result: this.state.result == null ? undefined : this.state.result,
            error: this.state.result != null ? null : this.state.error
          }
        : {
            isPending: false,
            result: this.state.result == null ? undefined : this.state.result,
            error: this.state.error
          }
    );
    // return this.props.children({
    //   isPending: this.state.isPending,
    //   result: this.state.result || undefined,
    //   error: this.state.result != null ? null : this.state.error
    // });

    // return this.props.children(
    //   this.state.isPending
    //     ? {
    //         isPending: true,
    //         result: this.state.result || undefined,
    //         error: this.state.result == null ? this.state.error : null
    //       }
    //     : {
    //         isPending: false,
    //         result: this.state.result || undefined,
    //         error: this.state.error
    //       }
    // );
  }
}
