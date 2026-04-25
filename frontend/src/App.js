import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing'
import Authentication from './pages/authentication';
import VideoMeetComponent from './pages/videoMeet';
import { AuthProvider } from './contexts/authContext';
import HomeComponent from './pages/home';
import HistoryPage from './pages/history';

function App() {
  return (
    <div className='App'>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/home' element={<HomeComponent />} />
            <Route path='/history' element={<HistoryPage />} />
            <Route path='/:url' element={<VideoMeetComponent />}></Route>
          </Routes>
        </AuthProvider>
      </Router>

    </div>
  );
}

export default App;
