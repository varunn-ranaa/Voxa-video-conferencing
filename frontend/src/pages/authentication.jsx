import React, { useState } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

export default function Authentication() {

  const [username, setUsername] = React.useState();
  const [password, setpassword] = React.useState();
  const [name, setname] = React.useState();
  const [error, seterror] = React.useState();
  const [messages, setmessages] = React.useState();
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  return (
    <div className='authContainer'>

      {/* NAV */}
      <nav className='landingNav'>
        <div className='navHeader'>
          <h2>VOX<span className='logoAccent'>A</span> <span className='logoMeet'>Meet</span></h2>
        </div>
        <div className='navList'>
          <Link to='/' className='navLink'>Home</Link>
          <Link to='/' className='navLink'>Join as Guest</Link>
        </div>
      </nav>

      {/* MAIN */}
      <div className='authMain'>

        {/* LEFT — branding */}
        <div className='authLeft'>
          <div className='authBadge'>
            <span className='badgeDot'></span>
            Secure · Encrypted · Instant
          </div>
          <h1 className='authTitle'>
            Welcome<br /><span className='heroAccent'>back.</span>
          </h1>
          <p className='authSub'>
            Sign in to continue your meetings, calls, and collaborations.
          </p>

          <div className='authFeatures'>
            <div className='authFeatureItem'>
              <span className='featureDot'></span>
              End-to-end encrypted calls
            </div>
            <div className='authFeatureItem'>
              <span className='featureDot'></span>
              4K HD video quality
            </div>
            <div className='authFeatureItem'>
              <span className='featureDot'></span>
              AI-powered meeting notes
            </div>
          </div>
        </div>

        {/* RIGHT — form card */}
        <div className='authCard'>
          <div className='authCardInner'>

            <h3 className='authCardTitle'>
              {formState === 0 ? 'Sign in to Voxa' : 'Create Account'}
            </h3>

            <div className='authTabs'>
              <button
                className={`authTab ${formState === 0 ? 'authTabActive' : ''}`}
                onClick={() => setFormState(0)}
              >
                Sign In
              </button>
              <button
                className={`authTab ${formState === 1 ? 'authTabActive' : ''}`}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </button>
            </div>

            <form className='authForm' onSubmit={(e) => e.preventDefault()}>

              {formState === 1 && (
                <div className='inputGroup'>
                  <label>Full Name</label>
                  <input type='text' className='authInput'
                    onChange={(e) => setname(e.target.value)} />
                </div>
              )}

              <div className='inputGroup'>
                <label>Username</label>
                <input type='text' className='authInput'
                  onChange={(e) => setUsername(e.target.value)} />
              </div>

              <div className='inputGroup'>
                <label>Password</label>
                <input type='password' className='authInput'
                  onChange={(e) => setpassword(e.target.value)} />
              </div>

              {formState === 1 && (
                <button type='submit' className='authSubmitBtn'>
                  Sign Up 
                </button>
              )}

              {formState === 0 && (
                <button type='submit' className='authSubmitBtn'>
                  Sign In 
                </button>
              )}

            {formState === 0 && (
              <>
                <p className='authSwitch'>
                  Don't have an account?{' '}
                  <Link to='/register' className='authSwitchLink'>Register</Link>
                </p>
              </>
            )}
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}