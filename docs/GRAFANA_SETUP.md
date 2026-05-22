# Grafana Setup for ZeroSmoke Monitoring

## 1. Install Grafana Locally

### Windows (Chocolatey)
```powershell
choco install grafana
```

### Windows (manual)
1. Download from https://grafana.com/grafana/download
2. Extract to `C:\Program Files\GrafanaLabs\grafana`
3. Run: `C:\Program Files\GrafanaLabs\grafana\bin\grafana-server.exe`

### macOS
```bash
brew install grafana
brew services start grafana
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get update
sudo apt-get install grafana
sudo systemctl start grafana-server
```

### Verify Installation
Open http://localhost:3000 — default login: `admin` / `admin`

---

## 2. Connect MongoDB to Grafana

### Option A: MongoDB Datasource Plugin (direct)

1. Install the plugin:
   ```bash
   grafana-cli plugins install grafana-mongodb-datasource
   ```
2. Restart Grafana
3. Add datasource:
   - Type: **MongoDB**
   - Connection String: `mongodb://localhost:27017/zerosmoke`
   - Authentication: Database auth if enabled

### Option B: MongoDB via Prometheus (mongodb_exporter)

1. Install mongodb_exporter:
   ```bash
   # Linux
   wget https://github.com/percona/mongodb_exporter/releases/latest/download/mongodb_exporter-0.40.0.linux-amd64.tar.gz
   tar -xzf mongodb_exporter-0.40.0.linux-amd64.tar.gz
   ./mongodb_exporter --mongodb.uri=mongodb://localhost:27017
   ```
2. Add Prometheus datasource pointing to `http://localhost:9216`

---

## 3. Infinity Datasource Setup (Recommended for REST API)

The Infinity datasource allows Grafana to query the ZeroSmoke Admin API directly.

### Install Infinity Datasource
```bash
grafana-cli plugins install yesoreyeram-infinity-datasource
```

### Configure Infinity Datasource
1. Go to **Configuration > Data Sources > Add**
2. Select **Infinity**
3. Name: `ZeroSmoke Admin API`
4. Default URL: `http://localhost:5000/api`
5. Authentication:
   - Type: **Bearer Token**
   - Token: `<your-admin-jwt-token>`
6. Save & Test

### Getting a JWT Token
```bash
# Login via API to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zerosmoke.com","password":"yourpassword"}'
```
Copy the `token` value from the response.

---

## 4. Example Dashboards & Queries

### Dashboard: "ZeroSmoke Overview"

#### Panel: Total Users (Stat)
- **Query type**: REST API
- **URL**: `http://localhost:5000/api/admin/stats/overview`
- **Parser**: JSON
- **Fields**: `data.totalUsers`

#### Panel: Active Users (Stat)
- **Parser**: JSON
- **Fields**: `data.activeUsers`

#### Panel: High Risk Users (Stat)
- **Fields**: `data.highRiskUsers`

#### Panel: Users Over Time (Time Series)
- **URL**: `http://localhost:5000/api/admin/stats/users?from={{from}}&to={{to}}&granularity=day`
- **Parser**: JSON
- **Fields**: `data.series[*].registeredUsers`
- **Time field**: `data.series[*].period`

#### Panel: Craving Average (Time Series)
- **URL**: `http://localhost:5000/api/admin/stats/cravings?from={{from}}&to={{to}}&granularity=day`
- **Fields**: `data.series[*].averageCraving`

#### Panel: Top Symptoms (Table)
- **URL**: `http://localhost:5000/api/admin/stats/symptoms?from={{from}}&to={{to}}&granularity=day`
- **Parser**: JSON
- **Fields**: `data.breakdown[*].symptom`, `data.breakdown[*].count`

#### Panel: Relapses Over Time (Time Series)
- **URL**: `http://localhost:5000/api/admin/stats/relapses?from={{from}}&to={{to}}&granularity=day`
- **Parser**: JSON
- **Fields**: `data.series[*].relapses`

#### Panel: High Risk Users List (Table)
- **URL**: `http://localhost:5000/api/admin/stats/high-risk-users`
- **Parser**: JSON
- **Fields**: `data[*].name`, `data[*].email`, `data[*].riskScore`, `data[*].cravingLevel`

---

## 5. Authorization for API Queries

All Infinity queries need the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

In Infinity config, set:
- **Authentication Method**: `Bearer Token`
- **Bearer Token**: `<paste-token-here>`

For dashboard sharing, use Grafana's built-in **API key** authentication:
1. Go to **Configuration > API Keys**
2. Create a new key with role `Viewer`
3. Use this key in datasource config

---

## 6. Metrics to Monitor for ZeroSmoke

| Category | Metric | Endpoint | Priority |
|---|---|---|---|
| Users | Total users | `/overview` | Critical |
| Users | Active vs inactive | `/users` | Critical |
| Users | Registrations over time | `/users` | High |
| Engagement | Daily check-ins | `/checkins` | Critical |
| Engagement | Active users per day | `/checkins` | High |
| Cravings | Average craving level | `/cravings` | Critical |
| Cravings | High craving events | `/cravings` | High |
| Relapses | Daily relapse count | `/relapses` | Critical |
| Relapses | Cigarettes smoked | `/relapses` | High |
| Symptoms | Top symptoms | `/symptoms` | Medium |
| Symptoms | Users affected | `/symptoms` | Medium |
| Risk | High-risk users | `/high-risk-users` | Critical |
| Risk | Risk score breakdown | `/high-risk-users` | High |
| Notifications | Sent vs read | `/notifications` | Low |
| Retention | Returning users | `/users` | High |

---

## 7. Recommended Dashboard Layout

```
+--------------------------------------------------+
|  ZeroSmoke Monitoring - [Time Range Selector]     |
+--------------------------------------------------+
| Total Users | Active | High Risk | Avg Craving    |
| [Stat]      | [Stat] | [Stat]    | [Stat]         |
+--------------------------------------------------+
| Users Over Time      | Check-ins Over Time        |
| [Area Chart]         | [Area Chart]               |
+--------------------------------------------------+
| Craving Average      | Relapses Over Time         |
| [Line Chart]         | [Bar Chart]                |
+--------------------------------------------------+
| Top Symptoms          | High Risk Users           |
| [Table]               | [Table]                   |
+--------------------------------------------------+
```

---

## 8. Troubleshooting

- **401 Unauthorized**: Token expired. Re-login via API to get a fresh JWT.
- **Empty data**: Check date range. The API requires `from` and `to` as `YYYY-MM-DD`.
- **CORS errors**: Ensure backend CORS allows Grafana origin (`http://localhost:3000`).
- **Slow queries**: For large time ranges, use `granularity=week` instead of `day`.
