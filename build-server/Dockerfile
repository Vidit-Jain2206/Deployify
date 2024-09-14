FROM ubuntu:focal

RUN apt-get update && apt-get install -y curl git \
    && curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get upgrade -y
RUN node -v
RUN npm -v

WORKDIR /home/app

COPY script.sh script.sh
COPY script.js script.js

RUN chmod +x /home/app/script.sh
RUN chmod +x /home/app/script.js

ENTRYPOINT [ "/home/app/script.sh" ]
