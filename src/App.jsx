import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Camp from './pages/Camp.jsx';
import Commission from './pages/Commission.jsx';
import GrowthArchive from './pages/GrowthArchive.jsx';
import HeartAssessment from './pages/HeartAssessment.jsx';
import HeartResult from './pages/HeartResult.jsx';
import Home from './pages/Home.jsx';
import Invite from './pages/Invite.jsx';
import MyCamp from './pages/MyCamp.jsx';
import Profile from './pages/Profile.jsx';
import SubjectAssessment from './pages/SubjectAssessment.jsx';
import SubjectResult from './pages/SubjectResult.jsx';
import Team from './pages/Team.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/camp" element={<Camp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/archive" element={<GrowthArchive />} />
        <Route path="/profile/camp" element={<MyCamp />} />
        <Route path="/profile/invite" element={<Invite />} />
        <Route path="/profile/team" element={<Team />} />
        <Route path="/profile/commission" element={<Commission />} />
      </Route>
      <Route path="/assessment/heart" element={<HeartAssessment />} />
      <Route path="/assessment/heart/result" element={<HeartResult />} />
      <Route path="/assessment/subject" element={<SubjectAssessment />} />
      <Route path="/assessment/subject/result" element={<SubjectResult />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
