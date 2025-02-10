import {Link , useNavigate} from "react-router-dom"
import { useState } from "react"
import TypingAnimation from "./TypingAnimation"
import "./Signup.css"

const Signup = () => {
  const [formData , setFormData] = useState({
    fullName:"",
    email: "",
    password: "",
    confirmPassword: "",
  })
  

  const handleChange=(e)=>{
    setFormData({...formData , [e.target.name]: e.target.value});
  }
  const navigate = useNavigate();
  const handleSubmit= async(e)=>{
    e.preventDefault();
    if(formData.password !== formData.confirmPassword){
      alert("The password is not matching..")
    }
    

  
  try{
    const response = await fetch("http://localhost:8000/signup" , {
      method :"POST",
      headers:{"Content-type" : "application/json"},
      body: JSON.stringify({
        fullName : formData.fullName,
        email : formData.email,
        password : formData.password,
        
      })
    })
    const data = await response.json();
    if(response.ok){
      alert("Signup Successful!");
      navigate("/login");

    } else{
      alert(`Signup Failed: ${data.error}`)
    }
  }catch(err){
    alert("Error Occured" , err.message)
  }
}


  return (

    <>
    <div className="maindivsign">
    <div className="animation-container">
        <TypingAnimation />
      </div>
           
      <div className="signup">
        <form action="" onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full-Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} /> <br />
            <label htmlFor="email">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} /> <br />
            <label htmlFor="password">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} /> <br />
            <label htmlFor="password">Confirm Password</label>
            <input type="password" name="confirmPassword" id=""  value={formData.confirmPassword} onChange={handleChange} /> <br />
            <button>Signup</button>

            <h4>Already have an account? <Link to={"/login"}>Login</Link> instead</h4>
        </form>
      </div>
    </div>
    </>
        
  )
}

export default Signup
