```mermaid
graph TD
    STAG[STAG API] <-->|Synchronizace dat| Server
    Server <-->|REST API| Devices
    Server <-->|REST API| AdminUI
    DB[(PostgreSQL)] <-->|Prisma ORM| Server
    AdminUI[Administrační rozhraní] <-->|tRPC| Server
    Devices[Zobrazovací zařízení] -->|Zobrazení| Display[E-ink displeje]
    Users[Uživatelé] -->|Správa| AdminUI
```
