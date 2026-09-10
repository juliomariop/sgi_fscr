import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PublicAttendance from './pages/PublicAttendance';
import PublicCommitteeAttendance from './pages/PublicCommitteeAttendance';
import PublicEvaluation from './pages/PublicEvaluation';
import { AuthProvider, useAuth } from './context/AuthContext';

// Planeación
import StrategicElements from './pages/StrategicElements';
import Pestal from './pages/Pestal';
import ProcessMap from './pages/ProcessMap';
import OrgChart from './pages/OrgChart';
import Stakeholders from './pages/Stakeholders';
import Bsc from './pages/Bsc';
import Communications from './pages/Communications';

// Docs
import SystemDocs from './pages/SystemDocs';

// Riesgos
import RisksIso from './pages/RisksIso';
import RisksSst from './pages/RisksSst';
import EnvAspects from './pages/EnvAspects';
import LegalMatrix from './pages/LegalMatrix';
import IntegratedObjectives from './pages/IntegratedObjectives';

// Nuevos módulos solicitados
import Maintenances from './pages/Maintenances';
import Trainings from './pages/Trainings';
import CustomerSatisfaction from './pages/CustomerSatisfaction';
import InternalAudits from './pages/InternalAudits';
import Pqrs from './pages/Pqrs';
import ManagementReviews from './pages/ManagementReviews';
import ActionPlans from './pages/ActionPlans';
import ChangeManagement from './pages/ChangeManagement';
import Accidents from './pages/Accidents';
import Committees from './pages/Committees';
import Emergencies from './pages/Emergencies';
import Vendors from './pages/Vendors';
import WasteManagement from './pages/WasteManagement';
import ControlSst from './pages/ControlSst';
import UnsafeReports from './pages/UnsafeReports';
import PublicUnsafeReport from './pages/PublicUnsafeReport';
import Inductions from './pages/Inductions';
import PublicInductionAttendance from './pages/PublicInductionAttendance';
import PublicInductionEvaluation from './pages/PublicInductionEvaluation';
import PublicCustomerSurvey from './pages/PublicCustomerSurvey';
import AdminSettings from './pages/AdminSettings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="view-container">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="view-container">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Administrador General') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/asistencia-publica/:trainingId" element={<PublicAttendance />} />
          <Route path="/asistencia-comite/:meetingId" element={<PublicCommitteeAttendance />} />
          <Route path="/evaluacion-publica/:trainingId" element={<PublicEvaluation />} />
          <Route path="/reporte-publico" element={<PublicUnsafeReport />} />
          <Route path="/induccion-asistencia" element={<PublicInductionAttendance />} />
          <Route path="/induccion-evaluacion" element={<PublicInductionEvaluation />} />
          <Route path="/encuesta-cliente" element={<PublicCustomerSurvey />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="strategicElements" element={<StrategicElements />} />
            <Route path="pestal" element={<Pestal />} />
            <Route path="processMap" element={<ProcessMap />} />
            <Route path="orgChart" element={<OrgChart />} />
            <Route path="stakeholders" element={<Stakeholders />} />
            <Route path="bsc" element={<Bsc />} />
            <Route path="communications" element={<Communications />} />
            
            <Route path="systemDocs" element={<SystemDocs />} />
            
            <Route path="risksIso" element={<RisksIso />} />
            <Route path="risksSst" element={<RisksSst />} />
            <Route path="envAspects" element={<EnvAspects />} />
            <Route path="legalMatrix" element={<LegalMatrix />} />
            <Route path="integratedObjectives" element={<IntegratedObjectives />} />
            
            <Route path="trainings" element={<Trainings />} />
            <Route path="maintenances" element={<Maintenances />} />
            <Route path="customerSatisfaction" element={<CustomerSatisfaction />} />
            <Route path="internalAudits" element={<InternalAudits />} />
            <Route path="pqrs" element={<Pqrs />} />
            <Route path="managementReviews" element={<ManagementReviews />} />
            <Route path="actionPlans" element={<ActionPlans />} />
            <Route path="changeManagement" element={<ChangeManagement />} />

            <Route path="accidents" element={<Accidents />} />
            <Route path="committees" element={<Committees />} />
            <Route path="emergencies" element={<Emergencies />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="waste" element={<WasteManagement />} />
            <Route path="controlSst" element={<ControlSst />} />
            <Route path="unsafeReports" element={<UnsafeReports />} />
            <Route path="induccion" element={<Inductions />} />
            <Route path="admin" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
