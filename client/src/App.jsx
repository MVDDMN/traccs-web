import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/*Public Imports*/
import Public from './Components/Public/Public';
import Home from './Components/Public/Home/Home';
import About from './Components/Public/About/About';
import Contact from './Components/Public/Contact/Contact';
import Donate from './Components/Public/Donate/Donate';
import Error from './Components/Public/Error/Error';

/*Login Imports*/
import Login from './Components/Login/Login';

/*Admin Imports*/
import Admin from './Components/Admin/Admin';

/*Dashboard Imports*/
import Dashboard from './Components/Admin/Dashboard/Dashboard';

/*Reports Imports*/
import Report from './Components/Admin/Reports/Reports';
import Archive from './Components/Admin/Reports/Archive/Archive';
import HistoryMap from './Components/Admin/Reports/HistoryMap/HistoryMap';

/*Resource Imports*/
import Resource from './Components/Admin/Resources/Resources';
import ResourceTable from './Components/Admin/Resources/ResourceTable/ResourceTable';
import ResourceDonate from './Components/Admin/Resources/Donate/ResourceDonate';

/*Request Imports*/
import Request from './Components/Admin/Requests/Request';
import Barangay from './Components/Admin/Requests/Barangay/Barangay';
import Community from './Components/Admin/Requests/Community/Community';
import RequestArchive from './Components/Admin/Requests/RequestArchive/RequestArchive';
import Personal from './Components/Admin/Requests/Personal/Personal';

function App() {

  return (
    <div>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <Public
                routes={
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/error" element={<Error />} />
                  </Routes>
                }
              />
            }
          />

          {/* Login Routes */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <Admin
                routes={
                  <Routes>

                    <Route path="/" element={<Dashboard />} />

                    <Route path="reports" element={<Report />}>
                      <Route index element={<Archive />} />
                      <Route path="archive" element={<Archive />} />
                      <Route path="historymap" element={<HistoryMap />} />
                    </Route>

                    <Route path="resource" element={<Resource />}>
                      <Route index element={<ResourceTable />} />
                      <Route path="resourcetable" element={<ResourceTable />} />
                      <Route path="resourcedonate" element={<ResourceDonate />} />
                    </Route>

                    <Route path="request" element={<Request />}>
                      <Route index element={<Barangay />} />
                      <Route path="barangay" element={<Barangay />} />
                      <Route path="community" element={<Community />} />
                      <Route path="requestarchives" element={<RequestArchive/>} />
                      <Route path="personal" element={<Personal/>} />
                    </Route>

                  </Routes>
                }
              />
            }
          />

        </Routes>
      </Router>
    </div>
  )
}

export default App
