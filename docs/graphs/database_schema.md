```mermaid
erDiagram
    User ||--o{ Device : spravuje
    Device {
        string id PK
        datetime createdAt
        string token
        string buildingId
        string roomId
        datetime lastSeen
        string authorId FK
    }
    User {
        string id PK
        datetime createdAt
        string name
        string email
        string password
    }
    AuditLog {
        string id PK
        int index
        string userId FK
        string operation
        datetime timestamp
        string userIp
        string error
    }
```
