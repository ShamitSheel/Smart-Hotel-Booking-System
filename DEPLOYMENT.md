# Free Deployment Guide

This project has an Angular frontend and multiple Spring Boot services:

- `Backend/eureka-server`
- `Backend/user-service`
- `Backend/hotel-service`
- `Backend/booking-service`
- `Backend/Ratings-And-Review-Service`
- `Backend/api-gateway`
- `Frontend`

## Important Security Step

Rotate any Gmail app password or database password that was previously committed to GitHub. The backend now reads mail and database values from environment variables.

## 1. Create A Free MySQL Database

Use a free MySQL host such as Aiven, Railway, or another provider that gives you a public MySQL connection string.

Create four databases:

- `userdb`
- `hoteldb`
- `bookingdb`
- `reviewdb`

Each backend service can use the same MySQL username/password, but each service should point to its own database in `DB_URL`.

Example for Aiven MySQL:

```text
DB_URL=jdbc:mysql://hotelify-shamitsheel.e.aivencloud.com:18965/userdb?sslMode=REQUIRED
DB_USERNAME=avnadmin
DB_PASSWORD=your_Aiven_password
```

## 2. Deploy Backend Services On Render

Create one Render Web Service for each backend folder. Use Docker deployment.

For every service:

- Connect GitHub repo: `ShamitSheel/Smart-Hotel-Booking-System`
- Branch: `master`
- Root directory: service folder, for example `Backend/user-service`
- Runtime: `Docker`
- Dockerfile path: `Dockerfile`
- Docker build context directory: `.`

Do not set Java build/start commands for Docker services. The Dockerfile builds the Spring Boot jar and starts it.

The backend Dockerfiles use Java 21. Keep the services on Docker runtime so Render uses the Java version from the Dockerfile.

Deploy in this order:

1. `Backend/user-service`
2. `Backend/hotel-service`
3. `Backend/booking-service`
4. `Backend/Ratings-And-Review-Service`
5. `Backend/api-gateway`

Eureka is optional for the hosted version because the API Gateway can route directly to service URLs. You can deploy `Backend/eureka-server` too, but the direct URL setup is usually simpler for free hosting.

### Env Vars For Each Database Service

Set these on `user-service`, `hotel-service`, `booking-service`, and `Ratings-And-Review-Service`:

```text
DB_USERNAME=avnadmin
DB_PASSWORD=your_Aiven_password
```

Use the matching `DB_URL` for each service:

```text
user-service:
DB_URL=jdbc:mysql://hotelify-shamitsheel.e.aivencloud.com:18965/userdb?sslMode=REQUIRED

hotel-service:
DB_URL=jdbc:mysql://hotelify-shamitsheel.e.aivencloud.com:18965/hoteldb?sslMode=REQUIRED

booking-service:
DB_URL=jdbc:mysql://hotelify-shamitsheel.e.aivencloud.com:18965/bookingdb?sslMode=REQUIRED

Ratings-And-Review-Service:
DB_URL=jdbc:mysql://hotelify-shamitsheel.e.aivencloud.com:18965/reviewdb?sslMode=REQUIRED
```

Mail settings are optional. Leave them empty for the first deployment. If password reset/email features are needed later, set:

```text
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_new_gmail_app_password
MAIL_HOST=smtp.gmail.com
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
```

### Env Vars For API Gateway

After each service is deployed, copy its Render URL and set these on `api-gateway`:

```text
USER_SERVICE_URL=https://your-user-service.onrender.com
HOTEL_SERVICE_URL=https://your-hotel-service.onrender.com
BOOKING_SERVICE_URL=https://your-booking-service.onrender.com
RATINGS_SERVICE_URL=https://your-ratings-service.onrender.com
CORS_ALLOWED_ORIGINS=https://smart-hotel-booking-system.vercel.app,http://localhost:4200
```

Then deploy/redeploy `api-gateway`.

Eureka clients are disabled by default in hosted services. If you deploy and use Eureka later, set `EUREKA_CLIENT_ENABLED=true` and `EUREKA_SERVER_URL=https://your-eureka-service.onrender.com/eureka/`.

## 3. Update Frontend API URL

After the API Gateway is live, replace frontend URLs that use:

```text
http://localhost:8000
```

with your API Gateway URL:

```text
https://your-api-gateway.onrender.com
```

Files currently using `localhost:8000` include services under:

```text
Frontend/src/app/core/services
Frontend/src/app/pages/booking
Frontend/src/app/pages/mybookings
```

## 4. Deploy Frontend On Vercel

Import the GitHub repo into Vercel.

Use:

```text
Root Directory: Frontend
Framework Preset: Angular
Build Command: npm run build
Output Directory: dist/Hotelify/browser
```

If Vercel detects a different output folder after build, use the folder it reports in the build logs.

## 5. Free Hosting Notes

Free backend services may sleep when inactive. The first request after sleeping can be slow.

If all microservices are on free instances, login/search may take time on the first load because several services may need to wake up.
