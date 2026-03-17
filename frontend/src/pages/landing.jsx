import React from 'react';
import '../App.css'
import { Link } from 'react-router-dom';

export default function landing() {
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
              <h2>VO<span className='logoAccent'>X</span>A <span className='logoMeet'>Meet</span></h2>
            </div>
            <div className='navList'>
               <p>Join as Guest</p>
               <p>Register</p>
               <div className='loginBtn' role='button'>
                  <p>Login</p>
                </div>
            </div>
        </nav>

        <div className='landingMainContainer'>
            <div><h1><span style={{color : '#846af5'}}>Connect</span> without limits.</h1>
              <p>Where great teams meet, decide, and deliver.</p>
              <div role='button'>
                <Link to={'/'}>Get Started</Link>
               </div>
            </div>
            <div>
                <img src="/mobile.png" alt="" style={{width : 450}}/>
            </div>
        </div>
    </div>
  )
}
