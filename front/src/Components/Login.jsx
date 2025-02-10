import { useState } from "react";
import "./Login.css"
import { Link , useNavigate } from "react-router-dom"
import TypingAnimation from "./TypingAnimation";


const Login = () => {
  const navigate = useNavigate();
  const [formData , setFormData] = useState({
    email: "",
    password:""
  })

  const handleChange = (e) =>{
    setFormData({...formData , [e.target.name]:e.target.value})
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();

    try{
      const response = await fetch("http://localhost:8000/login" ,{
        method : "POST" ,
        headers : {"Content-type" : "application/json"},
        body : JSON.stringify({
          email : formData.email,
          password : formData.password
          })
    })
    const data = await response.json();
    if(response.ok){
      
      localStorage.setItem("fullName" , data.fullName)
      localStorage.setItem("userId" , data.userId)
      alert("Login Successfull..");
      navigate("/dashboard");
    }
    else{
      alert("Invalid password or Email" , data.error)
    }
    }catch(err){
    alert("Internal Server Error")
    console.error(err)
  }

  }
  

  return (
    <div className="maindivlog">
      <div className="animatiom">
        <TypingAnimation words={[
            "Welcome Back!",
            "Please Login",
            "Let's get started!"
          ]}/>
      </div>
      
        <div className="login">
          
        <form action="" className="fromlogin" onSubmit={handleSubmit}>
          
            
            <label htmlFor="email">Email</label>
            <input type="email" name="email" className="inpt" value={formData.email} onChange={handleChange} /> <br />
            <label htmlFor="password">Password</label>
            <input type="password" name="password" className="inpt" value={formData.password} onChange={handleChange} /> <br />
           
            <button className="loginbtn">Login</button>

            <h4>Dont have an Account?<Link to={"/signup"}>Signup</Link> instead</h4>
        </form>
      </div>
      
    </div>
  )
}

export default Login
