import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

export default function Authentication() {
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

            <h3 className='authCardTitle'>Sign in to Voxa</h3>
            <p className='authCardSub'>Enter your credentials to continue</p>

            <form className='authForm' onSubmit={(e) => e.preventDefault()}>

              <div className='inputGroup'>
                <label>Email Address</label>
                <input type='email' placeholder='you@example.com' className='authInput' />
              </div>

              <div className='inputGroup'>
                <label>Password</label>
                <input type='password' placeholder='••••••••' className='authInput' />
              </div>

              <div className='forgotRow'>
                <span className='forgotLink'>Forgot password?</span>
              </div>

              <button type='submit' className='authSubmitBtn'>
                Sign In →
              </button>

            </form>

            <div className='authDivider'><span>or continue with</span></div>
            <p className='authSwitch'>
              Don't have an account?{' '}
              <Link to='/register' className='authSwitchLink'>Register</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}