# Monitoring & Observability

This service exposes Prometheus metrics at `/metrics`. You can scrape these metrics using a Prometheus server and visualize them with Grafana.

1. **Prometheus**
   - Configure a scrape job pointing at `http://<server>/metrics`.
   - Provide the `METRICS_API_KEY` header if set.
2. **Grafana**
   - Add Prometheus as a data source.
   - Import dashboards or build panels for counters and histograms like `claim_upload_total` and `claim_extraction_duration_seconds`.

For hosted solutions, Prometheus Cloud or Grafana Cloud can be used in place of self-hosted instances.
