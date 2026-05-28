# Grafana Dashboards for ZeroSmoke

## Infinity Datasource Configuration

### Setup
1. Install plugin: `grafana-cli plugins install yesoreyeram-infinity-datasource`
2. Restart Grafana
3. Add datasource:
   - Type: **Infinity**
   - Name: `ZeroSmoke API`
   - URL: `http://localhost:5000/api/admin/stats`
   - Authentication: **Bearer Token** → `<your-jwt>`

### Global Query Parameters
All time-series endpoints accept:
- `from` — start date (YYYY-MM-DD)
- `to` — end date (YYYY-MM-DD)
- `granularity` — day | week | month
- `format=grafana` — simplified output `[{time, value}]`

Use Grafana's **global variables** in Infinity queries:
```
{{from}}  → $__from (ISO)
{{to}}    → $__to (ISO)
```

---

## Dashboard 1: ZeroSmoke Overview (Monitoring)

### Panel: Current Stats (Stat)
| Setting | Value |
|---|---|
| Endpoint | `/summary` |
| Parser | JSON |
| Fields | `totalUsers`, `activeUsers`, `averageCraving`, `totalRelapses`, `activePlans`, `completedPlans` |

Create 6 Stat panels, each reading one field from the response.

### Panel: Users Over Time (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/users?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

### Panel: Check-ins Over Time (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/checkins?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

### Panel: Average Craving (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/cravings?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

### Panel: Relapses (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/relapses?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

---

## Dashboard 2: Clinical Research (Investigación)

### Panel: Symptom Frequency (Table)
| Setting | Value |
|---|---|
| Endpoint | `/symptoms?from={{from}}&to={{to}}&granularity=day` |
| Parser | JSON |
| Fields | `data.breakdown[*].symptom`, `data.breakdown[*].count`, `data.breakdown[*].uniqueUsers` |

### Panel: Craving Heatmap (Heatmap)
| Setting | Value |
|---|---|
| Endpoint | `/heatmap/cravings?from={{from}}&to={{to}}` |
| Parser | JSON |
| X field | `x` (day of week) |
| Y field | `y` (hour) |
| Value field | `value` (avg craving) |

### Panel: Plan Adherence (Table)
| Setting | Value |
|---|---|
| Endpoint | `/research?from={{from}}&to={{to}}` |
| Parser | JSON |
| Fields | `data.planAdherence[*].status`, `data.planAdherence[*].count`, `data.planAdherence[*].averageCompletion` |

### Panel: Weekly Trend (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/research?from={{from}}&to={{to}}&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

### Panel: Most Active Users (Table)
| Setting | Value |
|---|---|
| Endpoint | `/research?from={{from}}&to={{to}}` |
| Parser | JSON |
| Fields | `data.mostActiveUsers[*].name`, `data.mostActiveUsers[*].checkins`, `data.mostActiveUsers[*].lastCheckin` |

---

## Dashboard 3: Alerts & Risk (Alertas)

### Panel: High Risk Alerts (Table)
| Setting | Value |
|---|---|
| Endpoint | `/alerts/high-risk?from={{from}}&to={{to}}` |
| Parser | JSON |
| Fields | `data.alerts[*].userName`, `data.alerts[*].riskScore`, `data.alerts[*].cravingLevel`, `data.alerts[*].factors` |
| Thresholds | riskScore ≥ 70 → red, ≥ 40 → yellow |

### Panel: Recent Relapses (Table)
| Setting | Value |
|---|---|
| Endpoint | `/alerts/high-risk?from={{from}}&to={{to}}` |
| Parser | JSON |
| Fields | `data.recentRelapses[*].userName`, `data.recentRelapses[*].date`, `data.recentRelapses[*].cigarettesSmokedCount`, `data.recentRelapses[*].symptoms` |

### Panel: High Risk Users (Table)
| Setting | Value |
|---|---|
| Endpoint | `/high-risk-users` |
| Parser | JSON |
| Fields | `data[*].name`, `data[*].riskScore`, `data[*].cravingLevel`, `data[*].factors` |

---

## Dashboard 4: Notifications & Engagement

### Panel: Notifications Sent (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/notifications?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

### Panel: Notifications by Type (Table)
| Setting | Value |
|---|---|
| Endpoint | `/notifications?from={{from}}&to={{to}}` |
| Parser | JSON |
| Fields | `data.byType[*].type`, `data.byType[*].sent`, `data.byType[*].readRate` |

### Panel: User Registrations (Time Series)
| Setting | Value |
|---|---|
| Endpoint | `/users?from={{from}}&to={{to}}&granularity=day&format=grafana` |
| Parser | JSON |
| Time field | `time` |
| Value field | `value` |

---

## Using Grafana Variables

### Time Range Variables
Configure the Infinity query to use Grafana's built-in time range:

```
from: ${__from:date:YYYY-MM-DD}
to: ${__to:date:YYYY-MM-DD}
```

### Custom Variables
Create a variable `granularity` with values: `day`, `week`, `month`
Use in queries: `&granularity=${granularity}`

---

## Full Endpoint Reference

| Endpoint | Description | Supports format=grafana | Supports from/to |
|---|---|---|---|
| `/overview` | Today's stats (flat) | ✓ (flat JSON) | No |
| `/summary` | Compact summary | ✓ (flat JSON) | No |
| `/users` | Registration/login series | ✓ (time,value) | ✓ |
| `/checkins` | Check-in series | ✓ (time,value) | ✓ |
| `/cravings` | Craving average series | ✓ (time,value) | ✓ |
| `/relapses` | Relapse series | ✓ (time,value) | ✓ |
| `/notifications` | Notification series | ✓ (time,value) | ✓ |
| `/symptoms` | Symptom breakdown | ✓ (time,value) | ✓ |
| `/research` | Research metrics | ✓ (time,value) | ✓ |
| `/high-risk-users` | High risk user list | No (table data) | No |
| `/alerts/high-risk` | Alerts + recent relapses | No (table data) | ✓ |
| `/heatmap/cravings` | Craving heatmap data | No (heatmap format) | ✓ |
| `/export/checkins` | CSV download | No | ✓ |

---

## Example: Complete Dashboard JSON

For advanced users, here's a minimal dashboard configuration to import:

```json
{
  "title": "ZeroSmoke Monitoring",
  "panels": [
    {
      "title": "Total Users",
      "type": "stat",
      "datasource": "ZeroSmoke API",
      "targets": [{
        "query": "/summary",
        "parser": "json",
        "fields": ["totalUsers"]
      }]
    },
    {
      "title": "Check-ins Over Time",
      "type": "timeseries",
      "datasource": "ZeroSmoke API",
      "targets": [{
        "query": "/checkins?from=${__from:date:YYYY-MM-DD}&to=${__to:date:YYYY-MM-DD}&granularity=day&format=grafana",
        "parser": "json",
        "timeField": "time",
        "valueField": "value"
      }]
    },
    {
      "title": "Craving Heatmap",
      "type": "heatmap",
      "datasource": "ZeroSmoke API",
      "targets": [{
        "query": "/heatmap/cravings?from=${__from:date:YYYY-MM-DD}&to=${__to:date:YYYY-MM-DD}",
        "parser": "json",
        "xField": "x",
        "yField": "y",
        "valueField": "value"
      }]
    }
  ]
}
```
