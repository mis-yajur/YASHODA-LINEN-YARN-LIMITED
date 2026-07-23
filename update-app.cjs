const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import GateRegister from '.\/pages\/GateRegister';/, 
"import GateRegister from './pages/GateRegister';\nimport Login from './pages/Login';");

// Inside App component
const newApp = `export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const { user, isSyncing } = useApp();
  
  if (user === undefined) {
    // Still initializing (if we had a loading state for user)
  }
  
  if (user === null && !isSyncing) {
    return <Login />;
  }

  return (
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/gate" element={<GateRegister />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/issue" element={<MaterialIssue />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
  );
}
`;

code = code.replace(/export default function App\(\) \{[\s\S]*\}\n$/, newApp);

fs.writeFileSync('src/App.tsx', code);
