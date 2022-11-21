import "./styles.scss";
import { Link } from "react-router-dom";

import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, deleteUser, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import { getDatabase, ref, get, child, remove, set } from "firebase/database";

const firebaseConfig = {
  'apiKey': "AIzaSyCgwTq8vIGl5spCZFUxj_8AeBRBn4TEPeE",
  'authDomain': "cs510-flash-cards.firebaseapp.com",
  'databaseURL': "https://cs510-flash-cards-default-rtdb.firebaseio.com/",
  'projectId': "cs510-flash-cards",
  'storageBucket': "cs510-flash-cards.appspot.com",
  'messagingSenderId': "180819539604",
  'appId': "1:180819539604:web:a57ae8b5f3db217768a681",
  'measurementId': "G-L87JWQQREY" 
}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//console.log(auth);
const database = getDatabase(app);
const dbRef = ref(getDatabase());
const db = getDatabase();

const Navbar = ({ isDashboard }: any) => {

  const handleLogout = () => {
    window.localStorage.removeItem('flashCardUser')
    window.location.replace('/')
  }


  //const test_user = "2@email.com";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = () => {
    console.log(email)
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
          onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in...
        const uid = user.uid;
        console.log("user id:", uid)
        deleteUser(user!).then(() =>{
          console.log("Success delete accout...")
          window.location.replace('/')
        }).catch((error)=> {
          console.log("Error in deleting account...")
        });
      } else {
        // User is signed out...
        console.log("user already sign out")
      }
    });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });

    get(child(dbRef, 'users/')).then((snapshot) => {
      if(snapshot.exists()) {
        snapshot.forEach(element => {
          var ele_key = element.key;
          get(child(dbRef, 'users/'+ ele_key)).then((snapshot0) =>{
            //console.log(snapshot0.child("userId").val());
            //console.log(snapshot0.child("email").val());
            var temail = snapshot0.child("email").val();
            
            if(temail==email) {
              var userid = snapshot0.child("userId").val();
              //console.log(userid);
              get(child(dbRef, 'deck_invitees/')).then((snapshot1) =>{
                snapshot1.forEach(element1 =>{
                  var del_key = element1.key;
                  get(child(dbRef, 'deck_invitees/'+ del_key)).then((snapshot2) =>{
                    var del_id = snapshot2.child("userId").val();
                    if(del_id==userid){
                      console.log(element1.val())
                      set(ref(db, 'deck_invitees/' + del_key), {
                        deckId: null,
                        userId : null
                      })
                      set(ref(db, 'users/' + ele_key), {
                        email: null,
                        userId : null
                      })
                      console.log("delete success!")
                    }
                  })
                })
              })           
            }
          })
        });        
      } else {
        console.log('No Data');
      }
      }).catch((error) => {
        console.error(error);
      });
  }

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img className='img-fluid' src={require('assets/images/logo.png')} />
        </Link>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          {isDashboard ? (
            <div className="navbar-nav ml-auto navbar-centers gap-4">
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/explore"
                >
                  Explore
                </Link>
              </li>
              <Link to="/create-deck">
                <button className="btn btn-main">
                  <i className="lni lni-circle-plus mr-2"></i> 
                  <span className=''>Create Deck</span>
                </button>
              </Link>
              <li className="nav-item" onClick={handleLogout} style={{cursor: 'pointer', fontWeight: '600'}}>
                  <i className="lni lni-cross-circle mr-2" style={{fontWeight: '600'}}></i> Logout
              </li>

              <form onClick={handleDeleteAccount}>
                  <div className="form-group p-0" style={{paddingTop:'1pt', paddingBottom:'0px', marginTop:'0px', marginBottom:'0px'}}>
                    <label style={{fontSize: '4px', paddingTop:'1pt', marginTop:'0px', marginBottom:'0px'}}>Confirm Email address</label>
                    <input
                      style={{fontSize: '4px', height:'30px', paddingTop:'1px', marginTop:'0px', marginBottom:'0px'}}
                      type="email"
                      placeholder="your@mail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group p-0">
                    <label style={{fontSize: '4px', paddingTop:'0px', marginTop:'0px', marginBottom:'0px'}}>Confirm Password</label>
                    <input
                      style={{fontSize: '4px', height:'30px', paddingTop:'1px', paddingBottom:'10px',  marginTop:'0px', marginBottom:'0px'}}
                      type="password"
                      placeholder="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                </form>
                <button className="btn btn-main btn-block mb-3" type='submit' style={{paddingLeft:'0px' ,width:'50px', height:'30px', paddingTop:'1px', paddingBottom:'10px',  marginTop:'0px', marginBottom:'0px'}}>
                    {isSubmitting ? 'Delete in...' : 'Delete'+'Account'}
                </button>

            </div>
          ) : (
            <div className="navbar-nav ml-auto navbar-centers gap-4">
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/explore"
                >
                  Explore
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  aria-current="page"
                  to="/login"
                >
                  Login
                </Link>
              </li>
              <Link to="/register">
                <button className="btn btn-main">Register</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
