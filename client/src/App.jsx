import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/*Public Imports*/
import Public from './Components/Public/Public.jsx';
import Home from './Components/Public/Home/Home.jsx';
import About from './Components/Public/About/About.jsx';
import Contact from './Components/Public/Contact/Contact.jsx';
import Donate from './Components/Public/Donate/Donate.jsx';
import Download from './Components/Public/Download/Download.jsx';
import Error from './Components/Public/Error/Error.jsx';

/*Login Imports*/
import Login from './Components/Login/Login.jsx';
import Loading from './Components/Loading/Loading.jsx';
import Setup from './Components/Setup/Setup.jsx';

/*Admin Imports*/
import Admin from './Components/Admin/Admin.jsx';

/*Dashboard Imports*/
import Dashboard from './Components/Admin/Dashboard/Dashboard.jsx';

/*Reports Imports*/
import Report from './Components/Admin/Reports/Reports.jsx';
import Archive from './Components/Admin/Reports/Archive/Archive.jsx';
import HistoryMap from './Components/Admin/Reports/HistoryMap/HistoryMap.jsx';
import Live from './Components/Admin/Reports/Live/Live.jsx';

/*Resource Imports*/
import Resource from './Components/Admin/Resources/Resources.jsx';
import ResourceTable from './Components/Admin/Resources/ResourceTable/ResourceTable.jsx';
import ResourceDonate from './Components/Admin/Resources/Donate/ResourceDonate.jsx';
import ResourceArchive from './Components/Admin/Resources/ResourceHistory/ResourceHistory.jsx';

/*Request Imports*/
import Request from './Components/Admin/Requests/Request.jsx';
import Barangay from './Components/Admin/Requests/Barangay/Barangay.jsx';
import Community from './Components/Admin/Requests/Community/Community.jsx';
import RequestArchive from './Components/Admin/Requests/RequestArchive/RequestArchive.jsx';
import Personal from './Components/Admin/Requests/Personal/Personal.jsx';

/*Analytics Imports*/
import Analytics from './Components/Admin/Analytics/Analytics.jsx';
import AnalyticsReports from './Components/Admin/Analytics/Report/AnalyticsReports.jsx';
import AnalyticsRequests from './Components/Admin/Analytics/Request/AnalyticsRequests.jsx';
import AnalyticsSummary from './Components/Admin/Analytics/Summary/AnalyticsSummary.jsx';

/*Account Imports*/
import Accounts from './Components/Admin/Accounts/Accounts.jsx';
import Admins from './Components/Admin/Accounts/Admins/Admins.jsx';
import Users from './Components/Admin/Accounts/Users/Users.jsx';

/*Log Imports*/
import Logs from './Components/Admin/ActivityLog/Logs.jsx';

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
                    <Route path="/download" element={<Download />} />
                  </Routes>
                }
              />
            }
          />

          {/* Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/setup" element={<Setup />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <Admin
                routes={
                  <Routes>

                    <Route path="/" element={<Dashboard />} />

                    <Route path="reports" element={<Report />}>
                      <Route index element={<Live />} />
                      <Route path="live" element={<Live />} />
                      <Route path="archive" element={<Archive />} />
                      <Route path="historymap" element={<HistoryMap />} />
                    </Route>

                    <Route path="resource" element={<Resource />}>
                      <Route index element={<ResourceTable />} />
                      <Route path="resourcetable" element={<ResourceTable />} />
                      <Route path="resourcedonate" element={<ResourceDonate />} />
                      <Route path="resourcearchive" element={<ResourceArchive />} />
                    </Route>

                    <Route path="request" element={<Request />}>
                      <Route index element={<Barangay />} />
                      <Route path="barangay" element={<Barangay />} />
                      <Route path="community" element={<Community />} />
                      <Route path="requestarchives" element={<RequestArchive/>} />
                      <Route path="personal" element={<Personal/>} />
                    </Route>

                    <Route path="analytics" element={<Analytics />}>
                      <Route index element={<AnalyticsSummary/>} /> 
                      <Route path="analyticssummary" element={<AnalyticsSummary/>} />
                      <Route path="analyticsreports" element={<AnalyticsReports/>} />
                      <Route path="analyticsrequests" element={<AnalyticsRequests/>} />
                    </Route>

                    <Route path="accounts" element={<Accounts />}>
                      <Route index element={<Users />} />
                      <Route path="admins" element={<Admins />} />
                      <Route path="users" element={<Users />} />
                    </Route>

                    <Route path="logs" element={<Logs />}/>

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

export default App;
