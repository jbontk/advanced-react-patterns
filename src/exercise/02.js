// Compound Components
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {Switch} from '../switch'

function Toggle({children}) {
    const [on, setOn] = React.useState(false)
    const toggle = () => setOn(!on)

    const allowedTypes = [ToggleOn, ToggleOff, ToggleButton] // allowedTypes for passing down the props

    return React.Children.map(children, (child, index) => {
        //console.log(child)
        if (!allowedTypes.includes(child.type)) return child

        return React.cloneElement(child, {on, toggle}) // using React.cloneElement to pass down the props that we want to the child components
            // , without needing to pass the props from the parent component
    })
}

const ToggleOn = ({on, children}) => on ? children : null;
const ToggleOff = ({on, children}) => on ? null : children
const ToggleButton = ({on, toggle}) => <Switch on={on} onClick={toggle}/>

function App() {
    // props of <ToggleOn>, <ToggleOff>, and <ToggleButton> are provided implicitly
    return (
        <div>
            <Toggle>
                <ToggleOn>The button is on</ToggleOn>
                <ToggleOff>The button is off</ToggleOff>
                <span>Hello</span>
                <ToggleButton/>
            </Toggle>
        </div>
    )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
