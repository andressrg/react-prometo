import React from 'react';

export class Promiser extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      isPending: this.props.promise != null,
      result: null,
      error: null,

      promise: null
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.promise === state.promise) return null;
    return {
      promise: props.promise,
      isPending: true
    };
  }

  componentDidMount() {
    this.subscribeToPromise(this.props.promise);
  }

  componentDidUpdate(prevProps) {
    if (this.props.promise !== prevProps.promise) {
      this.subscribeToPromise(this.props.promise);
    }
  }

  componentWillUnmount() {
    this.stop = true;
  }

  subscribeToPromise(promise) {
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
              .then(() => this.props.onFulfilled({ result }))
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
    return this.props.children({
      isPending: this.state.isPending,
      result: this.state.result || undefined,
      error: this.state.error
    });
  }
}
