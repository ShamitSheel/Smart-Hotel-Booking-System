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
- `hotelDb`
- `bookingDb`
- `reviewDb`

Each backend service can use the same MySQL username/password, but each service should point to its own database in `DB_URL`.

Example:

```text
DB_URL=jdbc:mysql://your-mysql-host:3306/userdb?useSSL=true&requireSSL=true
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password
```

## 2. Deploy Backend Services On Render

Create one Render Web Service for each backend folder.

For every service:

- Connect GitHub repo: `ShamitSheel/Smart-Hotel-Booking-System`
- Branch: `master`
- Root directory: service folder, for example `Backend/user-service`
- Build command: `./mvnw clean package -DskipTests`
- Start command: `java -jar target/*.jar`
- Environment variable: `JAVA_VERSION=17`

If Render has trouble with `./mvnw`, use `mvn clean package -DskipTests`.

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
DB_URL=jdbc:mysql://your-mysql-host:3306/the_service_database?useSSL=true&requireSSL=true
DB_USERNAME=your_mysql_user
DB_PASSWORD=your_mysql_password
```

For `user-service`, also set mail values if password reset/email features are needed:

```text
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_new_gmail_app_password
```

### Env Vars For API Gateway

After each service is deployed, copy its Render URL and set these on `api-gateway`:

```text
USER_SERVICE_URL=https://your-user-service.onrender.com
HOTEL_SERVICE_URL=https://your-hotel-service.onrender.com
BOOKING_SERVICE_URL=https://your-booking-service.onrender.com
RATINGS_SERVICE_URL=https://your-ratings-service.onrender.com
```

Then deploy/redeploy `api-gateway`.

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
