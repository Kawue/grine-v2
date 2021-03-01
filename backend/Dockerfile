FROM python:3.7-slim
RUN apt-get clean \
    && apt-get -y update
RUN apt-get -y install nginx \
    && apt-get -y install python3-dev \
    && apt-get -y install build-essential
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt --src /usr/local/src
COPY . .
COPY nginx.conf /etc/nginx
CMD service nginx start && uwsgi --ini uwsgi.ini
