package com.cts.booking_service.client;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class FeignHeaderInterceptor implements RequestInterceptor {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String ROLES_HEADER = "X-Roles"; // Add constant for roles**

    @Override
    public void apply(RequestTemplate requestTemplate) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();

            // Forward X-User-Id header
            String userId = request.getHeader(USER_ID_HEADER);
            if (userId != null) {
                requestTemplate.header(USER_ID_HEADER, userId);
            }

            // Forward X-Roles header
            String roles = request.getHeader(ROLES_HEADER);
            if (roles != null) {
                requestTemplate.header(ROLES_HEADER, roles);
            }
        }
    }
}
