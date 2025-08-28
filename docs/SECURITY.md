# Security Documentation

## Service-to-Service Authentication

### Overview
All inter-service communication is secured using HMAC-signed tokens with timestamps to prevent replay attacks.

### Authentication Flow
1. Service generates a token containing:
   - Service name
   - Current timestamp
   - HMAC signature using shared secret

2. Token is base64 encoded and sent with connection request

3. Realtime service verifies:
   - Token age (max 5 minutes)
   - Signature validity
   - Service is in allowed list

### Security Features
- **Token Expiration:** Tokens expire after 5 minutes
- **Rate Limiting:** 100 events per minute per service
- **Service Whitelisting:** Only approved services can connect
- **Event Authorization:** Services can only emit specific events
- **Audit Logging:** All events are logged with service identity

### Configuration
```env
# In all services
SERVICE_AUTH_KEY=strong-random-key-change-in-production

# In realtime service
ALLOWED_SERVICES=auth-service,attendance-service,notification-service
```

### Service Permissions
- **attendance-service**: course:*, session:*, attendance:marked
- **auth-service**: user:created, user:verified, user:updated
- **notification-service**: notification:*

### Security Monitoring
Real-time monitoring tracks:
- Authentication attempts
- Rate limit violations
- Unauthorized event attempts
- Service connection patterns

### Best Practices
1. Rotate SERVICE_AUTH_KEY regularly
2. Monitor security events for anomalies
3. Use environment-specific keys
4. Enable audit logging in production
5. Implement network-level restrictions

### Emergency Response
If security breach detected:
1. Rotate all service keys immediately
2. Check audit logs for suspicious activity
3. Temporarily disable affected services
4. Update allowed services list
5. Investigate root cause
