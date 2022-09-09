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

function useControlledSwitchWithWarning(controlProp, controlPropName, componentName) {
  const isControlled = controlProp != null
  const {current: wasControlled} = useRef(isControlled) // use a ref to keep track of whether we were controlled in the past

  useEffect(() => {
    // see the following warning in DevTools console by initializing bothOn state in App component with an empty state (uncontrolled => controlled)
    warning(!(isControlled && !wasControlled), `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`)

    // see the following warning in DevTools console by setting bothOn in App component handleToggleChange to an empty state (controlled => uncontrolled)
    warning(!(!isControlled && wasControlled), `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`)
  }, [componentName, controlPropName, isControlled, wasControlled])

}

function useOnChangeReadOnlyWarning(
    controlPropValue,
    controlPropName,
    componentName,
    hasOnChange,
    readOnly,
    readOnlyProp,
    initialValueProp,
    onChangeProp
) {
  const isControlled = controlPropValue != null
  useEffect(() => {
    warning(hasOnChange || !isControlled || readOnlyProp,
        `A \`${controlPropName}\` prop was provided to \`${componentName}\` without an \`${onChangeProp}\` handler. This will result in a read-only \`${controlPropName}\` value. If you want it to be mutable, use \`${initialValueProp}\`. Otherwise, set either \`${onChangeProp}\` or \`${readOnlyProp}\`.`)
  }, [onChangeProp,
    isControlled,
    readOnlyProp,
    hasOnChange,
    controlPropName,
    componentName,
    initialValueProp])
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
  readOnly = false
  } = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  // "uncontrolled": state is managed inside the component
  // "controlled": state is managed outside the component

  const onIsControlled = controlledOn != null // will be true if controlledOn is not null and is not undefined
  // (in JavaScript, undefined == null is true (but undefined === null is false)
  const on = onIsControlled ? controlledOn : state.on

  useControlledSwitchWithWarning(onIsControlled, 'on', 'useToggle')
  useOnChangeReadOnlyWarning(
      on,
      'on',
      'useToggle',
      Boolean(onChange),
      readOnly,
      readOnly,
      'initialOn',
      onChange
  )


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

function Toggle({on: controlledOn, onChange, readOnly}) { // default value of readOnly prop only set in useToggle custom hook
  // no need to set that default value here, as undefined will be passed, and it will not fail
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange, readOnly})
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
        <Toggle on={bothOn} readOnly={true} />
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
