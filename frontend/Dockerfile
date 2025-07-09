# Use Nginx to serve static files
FROM nginx:stable-alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy locally built frontend files into Nginx's public directory
COPY build /usr/share/nginx/html
# Replace default nginx config to support client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

