FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    openscad \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /outputs

CMD ["tail", "-f", "/dev/null"]