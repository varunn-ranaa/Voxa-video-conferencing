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
          <Link to='/guest' style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Join as Guest</Link>
          <Link to='/auth?mode=register' style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Register</Link>
          <Link to='/auth' style={{ textDecoration: 'none' }}>
            <div className='loginBtn' role='button'>
              <p>Login</p>
            </div>
          </Link>
        </div>
      </nav>

      <div className='landingMainContainer'>

        <div className='left'>
          <div className='landBadge'>
            <span className='badgeDot'></span>
            Secure · Encrypted · Instant
          </div>
          <h1><span style={{ color: '#846af5' }}>Connect</span> without limits.</h1>
          <p>Where great teams meet, decide, and deliver.</p>
          <div role='button'>
            <Link to={'/auth'}>Get Started</Link>
          </div>
        </div>
        <div className='right'>
          <img src="/mobile.png" alt="" style={{ width: 450 }} />
        </div>
      </div>
    </div>
  )
}
