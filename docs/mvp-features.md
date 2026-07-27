# MVP feature map

Aligned with HarvestIQ lifecycle Phase 3 and the validation report (July 2026).

| Planned feature | Status | Location |
|-----------------|--------|----------|
| Dashboard & analytics | Implemented | `apps/web` → `/` |
| Farm management (add/edit/remove) | Implemented | `/farms` |
| Crop image upload | Implemented | `/diagnose` |
| AI classification + confidence | Implemented (demo API) | `/api/diagnose` |
| Treatment recommendations | Implemented | Diagnose specimen card |
| Weather-based 7-day risk | Partial — manual field conditions | `/api/forecast` |
| Diagnosis history | Implemented | `/reports` |
| Nearby resources / Maps | Implemented | `/resources` |
| Settings (profile, units, clear data) | Implemented | `/settings` |
| Authentication / roles | Deferred | Removed after usability feedback |
| Live OpenWeather feed | Not in MVP | Future |
| YOLO / EfficientNet production models | Not in MVP | Future |

## User flow

Create farm → Upload leaf photo → Classify → Enter field conditions → Forecast → Save report → Review dashboard / resources
