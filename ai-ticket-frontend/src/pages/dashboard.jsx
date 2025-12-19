import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        // User doesn't have access, fetch user stats instead
        const userRes = await fetch(`${API_URL}/api/analytics/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setAnalytics({ isUserStats: true, ...userData.stats });
      } else if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      } else {
        setError("Failed to fetch analytics");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error m-4">
        <span>{error}</span>
      </div>
    );
  }

  // User stats view
  if (analytics?.isUserStats) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">My Tickets</div>
            <div className="stat-value text-primary">{analytics.totalTickets}</div>
          </div>
          {Object.entries(analytics.ticketsByStatus || {}).map(([status, count]) => (
            <div key={status} className="stat bg-base-200 rounded-lg">
              <div className="stat-title">{status}</div>
              <div className="stat-value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin/Moderator dashboard
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-primary text-primary-content rounded-lg">
          <div className="stat-title text-primary-content/80">Total Tickets</div>
          <div className="stat-value">{analytics?.totalTickets || 0}</div>
        </div>
        <div className="stat bg-secondary text-secondary-content rounded-lg">
          <div className="stat-title text-secondary-content/80">Unassigned</div>
          <div className="stat-value">{analytics?.unassignedTickets || 0}</div>
        </div>
        <div className="stat bg-accent text-accent-content rounded-lg">
          <div className="stat-title text-accent-content/80">Recent (7 days)</div>
          <div className="stat-value">{analytics?.recentTickets || 0}</div>
        </div>
        <div className="stat bg-info text-info-content rounded-lg">
          <div className="stat-title text-info-content/80">Total Users</div>
          <div className="stat-value">
            {Object.values(analytics?.usersByRole || {}).reduce((a, b) => a + b, 0)}
          </div>
        </div>
      </div>

      {/* Tickets by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Tickets by Status</h2>
            <div className="space-y-3">
              {Object.entries(analytics?.ticketsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="badge badge-lg">{status}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <progress
                      className="progress progress-primary"
                      value={count}
                      max={analytics?.totalTickets || 1}
                    ></progress>
                  </div>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Tickets by Priority</h2>
            <div className="space-y-3">
              {Object.entries(analytics?.ticketsByPriority || {}).map(([priority, count]) => {
                const colorMap = {
                  high: "progress-error",
                  medium: "progress-warning",
                  low: "progress-success",
                };
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <span className={`badge badge-lg ${priority === 'high' ? 'badge-error' : priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                      {priority}
                    </span>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <progress
                        className={`progress ${colorMap[priority] || 'progress-primary'}`}
                        value={count}
                        max={analytics?.totalTickets || 1}
                      ></progress>
                    </div>
                    <span className="font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Users by Role & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Users by Role</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(analytics?.usersByRole || {}).map(([role, count]) => (
                <div key={role} className="stat bg-base-100 rounded-lg flex-1 min-w-[120px]">
                  <div className="stat-title capitalize">{role}s</div>
                  <div className="stat-value text-lg">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Top Skills in Tickets</h2>
            <div className="flex flex-wrap gap-2">
              {(analytics?.topSkills || []).map((skill, index) => (
                <div key={skill._id} className="badge badge-lg badge-outline gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  {skill._id}
                  <span className="badge badge-sm badge-primary">{skill.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Per Day Chart */}
      {analytics?.ticketsPerDay?.length > 0 && (
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h2 className="card-title">Tickets Created (Last 7 Days)</h2>
            <div className="flex items-end gap-2 h-40">
              {analytics.ticketsPerDay.map((day) => {
                const maxCount = Math.max(...analytics.ticketsPerDay.map((d) => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={day._id} className="flex-1 flex flex-col items-center">
                    <span className="text-xs mb-1">{day.count}</span>
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? "10px" : "0" }}
                    ></div>
                    <span className="text-xs mt-1">{day._id.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
