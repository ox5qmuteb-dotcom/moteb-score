# Pull Request Tracking & Analysis
## تتبع ومراجعة طلبات السحب

## PR Health Index

The PR Health Index measures operational quality and development velocity.

### Formula

```
PR Health Index = 
  (25% × Review Coverage)
  + (25% × Merge Effectiveness)
  + (20% × Review Speed)
  + (15% × Change Quality)
  + (15% × Community Participation)
```

---

## Key PR Metrics

### 1. Open Pull Requests
**Metric:** طلبات السحب المفتوحة

- **Definition:** Number of PRs currently awaiting review or action.
- **Why it matters:** Shows current backlog and capacity.
- **Target:** Proportional to team size, typically < 50% of monthly merge volume.

### 2. Reviewed Pull Requests
**Metric:** طلبات السحب المراجعة

- **Definition:** PRs that have received at least one formal review.
- **Why it matters:** Indicates code quality assurance.
- **Target:** > 95% of all PRs.

### 3. Merged Pull Requests
**Metric:** طلبات السحب المدمجة

- **Definition:** PRs successfully merged into main branches.
- **Why it matters:** Shows delivery volume and velocity.
- **Target:** Consistent monthly trend.

### 4. Closed Without Merge
**Metric:** الطلبات المغلقة بدون دمج

- **Definition:** PRs closed/rejected without merging.
- **Why it matters:** Indicates filtering and quality gates.
- **Target:** 5–15% of total PRs (healthy rejection rate).

### 5. Merge Rate
**Metric:** معدل الدمج

- **Formula:** (Merged PRs / Total PRs) × 100
- **Why it matters:** Shows approval efficiency.
- **Target:** 70–85% (some PRs should be rejected).

### 6. Average Review Time
**Metric:** متوسط وقت المراجعة

- **Definition:** Time from creation to first review.
- **Why it matters:** Shows responsiveness.
- **Target:** < 24 hours for critical PRs, < 48 hours for standard.

### 7. Average Merge Time
**Metric:** متوسط وقت الدمج

- **Definition:** Time from creation to merge or closure.
- **Why it matters:** Shows overall delivery speed.
- **Target:** < 72 hours for most PRs.

### 8. Age of Open PRs
**Metric:** عمر الطلبات المفتوحة

- **Definition:** How long PRs have been open.
- **Why it matters:** Identifies stalled work.
- **Target:** None older than 30 days without clear reason.

### 9. Test Coverage in PRs
**Metric:** نسبة الاختبارات في PRs

- **Definition:** Percentage of PRs including tests.
- **Why it matters:** Ensures reliability.
- **Target:** > 80% for all PRs.

---

## PR Type Classification

| Type | Weight | Description |
|---|---:|---|
| Security Fix | High | Critical vulnerability patches |
| New Feature | High | User-facing innovations |
| Performance | High | System efficiency improvements |
| Bug Fix | Medium | Error corrections |
| Testing | Medium | Test coverage additions |
| Documentation | Medium | Knowledge and guides |
| Refactoring | Low | Code organization without behavior change |
| Dependencies | Low | Dependency updates |

---

## PR Tracking Template

| Field | English | Arabic |
|---|---|---|
| Company | الشركة | |
| Repository | المستودع | |
| PR Number | رقم الطلب | |
| Status | الحالة | |
| Created Date | تاريخ الإنشاء | |
| First Review Date | تاريخ أول مراجعة | |
| Merge Date | تاريخ الدمج | |
| Reviewer Count | عدد المراجعين | |
| Tests Included | الاختبارات | |
| Change Type | نوع التغيير | |
| Processing Time | مدة المعالجة | |
| Quality Score | درجة الجودة | |

---

## Analysis Guidelines

1. **Trend analysis:** Compare metrics over 30, 90, and 365 day periods.
2. **Normalization:** Account for team size, project maturity, and codebase complexity.
3. **Correlation:** Link PR metrics to product releases and customer impact.
4. **Benchmarking:** Compare against industry standards and peer companies.

---

## Red Flags

- Merge rate < 50% (too much rejection)
- Average review time > 1 week
- High percentage of old, open PRs
- < 50% test coverage
- No security fix PRs in 6 months
