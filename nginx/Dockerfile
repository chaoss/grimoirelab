FROM nginx:latest

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY uwsgi_params /etc/nginx/uwsgi_params

CMD ["nginx", "-g", "daemon off;"]
