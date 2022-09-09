// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {Switch} from '../switch'
import warning from "warning";
import {useEffect, useRef} from "react";

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  on: controlledOn,
  onChange,
  readonly = false
  } = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  // "uncontrolled": state is managed inside the component
  // "controlled": state is managed outside the component

  const onIsControlled = controlledOn != null // will be true if controlledOn is not null and is not undefined
  // (in JavaScript, undefined == null is true (but undefined === null is false)

  const {current: onWasControlled} = useRef(onIsControlled) // use a ref to keep track of whether we were controlled in the past

  useEffect(() => {
    // see the following warning in DevTools console by initializing bothOn state in App component with an empty state (uncontrolled => controlled)
    warning(!(onIsControlled && !onWasControlled), 'A component is changing an uncontrolled Toggle to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled Toggle for the lifetime of the component.')

    // see the following warning in DevTools console by setting bothOn in App component handleToggleChange to an empty state (controlled => uncontrolled)
    warning(!(!onIsControlled && onWasControlled), 'A component is changing a controlled Toggle to be uncontrolled. This is likely caused by the value changing from a defined value to undefined, which should not happen. Decide between using a controlled or uncontrolled Toggle for the lifetime of the component.')
  }, [onIsControlled, onWasControlled])


  useEffect(() => {
    const hasOnChange = Boolean(onChange) // equivalent to !!onChange
    warning(hasOnChange || !onIsControlled || readonly, 'You provided an `on` prop to a Toggle without an `onChange` handler. This will render a read-only Toggle. If the field should be mutable use `initialOn`. Otherwise, set either `onChange` or `readOnly`.')
  }, [onChange, onIsControlled, readonly])

  const on = onIsControlled ? controlledOn : state.on

  function dispatchWithOnChange(state, action) {
    if (!onIsControlled) { // this if clause is there to avoid unnecessary re-renders)
      dispatch(action) // that dispatch call is used only for uncontrolled Toggle
    }

    const newState = reducer({...state, on}, action)
    onChange?.(newState, action)
  }

  const toggle = () => dispatchWithOnChange(state, {type: actionTypes.toggle})
  const reset = () => dispatchWithOnChange(state, {type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange, readonly}) { // default value of readonly prop only set in useToggle custom hook
  // no need to set that default value here, as undefined will be passed, and it will not fail
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange, readonly})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} readonly={true} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
