
import "../src/Components/App.css"
import Signup from "./Components/Signup"
import Login from "./Components/Login"
import {BrowserRouter as Router , Routes , Route ,} from "react-router-dom"
import Dash from "./Components/Dash"

const App = () => {
//this is a comment from ai-collab 
  return (
    <div>
     

<div>

    <Router>
      <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Signup/>}/>
        <Route path="/dashboard" element={<Dash/>}/>
        
        

      </Routes>
    </Router>
</div>
  </div>
  )
}

export default App
