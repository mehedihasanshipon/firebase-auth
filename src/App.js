// import logo from './logo.svg';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser,setNewUser] = useState(false)
  const [user,setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error : '',
    message: false
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = ()=> {
    firebase.auth().signInWithPopup(provider)
    .then (res => {
      const {displayName,email,photoURL} = res.user;
      const signInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signInUser)
      console.log(displayName,email,photoURL);
    }).catch(error => {
      console.log(error.message)
    })
  }

  const handleSignOut = ()=>{
    firebase.auth().signOut()
    .then(res => {
      const signOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(signOutUser)
    })
  }

  const handleFbLogin = ()=> {
    firebase
    .auth()
    .signInWithPopup(fbProvider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
      console.log(credential)
      // The signed-in user info.
      var user = result.user;
      console.log('Fb user info:',user)

      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var accessToken = credential.accessToken;

      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log(errorCode,errorMessage)

      // ...
    });
  }

  const handleBlur = (e) => {
    // console.log(e.target.name,e.target.value);
    let isFormValid = true;
    if(e.target.name === 'email'){
      isFormValid = /\S+@\S+\.\S+/.test(e.target.value);
      // console.log(isFormValid); 
    }
    if(e.target.name === 'password'){
        const isValidLength = e.target.value.length > 6;
        const isValidPassword = /\d{1}/.test(e.target.value);
        isFormValid = isValidLength && isValidPassword;
        // console.log(isFormValid)
    }
    if(isFormValid){
     const newUser = {...user};
    //  console.log(newUser)
     newUser[e.target.name] = e.target.value;
    //  console.log(newUser)
     setUser(newUser);
    }
  }

  const handleSubmit = (e) => {
    // console.log(user.email,user.password)
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          // Signed in 
          const newUserInfo = {...user};
          newUserInfo.message = true ;
          newUserInfo.error = '';
          setUser(newUserInfo);
          updateProfile(user.name)
          // ...
        })
        .catch((error) => {
          const newUserInfo = {...user};
          newUserInfo.message = false;
          newUserInfo.error = error.message;
         setUser(newUserInfo)
          // ..
        });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then((userCredential) => {
        // Signed in
        const newUserInfo = {...user};
          newUserInfo.message = true ;
          newUserInfo.error = '';
          setUser(newUserInfo);
          console.log(userCredential)
      })
      .catch((error) => {
        const newUserInfo = {...user};
          newUserInfo.message = false;
          newUserInfo.error = error.message;
         setUser(newUserInfo)
      });
    }
    e.preventDefault();
}

const updateProfile = name => {
  var user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name
      }).then(function() {
        console.log('User name update successfully')
      }).catch(function(error) {
        // An error happened.
      });
}

  return (
    <div className="App">
      {
        user.isSignedIn?<button onClick={handleSignOut} >Sign Out</button>
        :<button onClick={handleSignIn} >Sign in</button>
      } <br/>
      <button onClick={handleFbLogin}>Facebook Login</button>
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name} </p>
          <p>Your email: {user.email} </p>
          <img src={user.photo} alt=""/>
        </div>
      }

      <h1>Our own authentication</h1>
      <input type="checkbox" onChange={()=>setNewUser(!newUser)} name='newUser'/>
      <label htmlFor="newUser">Register</label>
      <form onSubmit = {handleSubmit}>
        { newUser && <input onBlur = {handleBlur} name='name' type="text" placeholder="Your Name" required /> } <br/>
        <input onBlur = {handleBlur} name='email' type="text" placeholder="Your email" required /> <br/>
        <input onBlur = {handleBlur} name='password' type="password" placeholder="Your Password" required /><br/>
        <input type="submit" value={newUser ? 'Sign up':'Sign in'}/>
      </form>
      {
        user.message && <p style={{color:'green'}}>User {newUser? 'created':'logged in' } successfully</p>
      }
      <p style={{color:'red'}}>{user.error}</p>
    </div>
  );
}

export default App;
