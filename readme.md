
How to install
==============

1. Database

  The database used in this project is postgres
    PGHOST_GLARE=postgresql://localhost:5432/glare
    PGUSER

2. Server Configuration

  The port the server uses is looked for in
    * GLARE_PORT
    * API_PORT
    * PORT
  Order is important, so if all env variables are set, GLARE_PORT wins.

3. Optional

  Sentry: SENTRY_GLARE_DNS
