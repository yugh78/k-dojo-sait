.PHONY: default run-server start-db stop-db restart-db nala-upgrade install-python-deps install-ubuntu-tools help

default: help

##= Run

ENV_FILE := ./.env

$(ENV_FILE):
	cp ./examples/example.env $@
	@echo "Environment file ('$@') is created, you should edit it"

install-python-deps:
	pip install -r ./server/requirements.txt

run-server: format
	source $(ENV_FILE) && \
	python ./server/manage.py runserver

format:
	python -m black ./server

start-db: $(ENV_FILE)
	source $(ENV_FILE) && \
	sudo docker compose up -d

stop-db:
	sudo docker compose down || echo "Already stopped"

restart-db: stop-db start-db

migrate-db:
	source $(ENV_FILE) && \
		cd ./server/ && \
		python manage.py migrate


##= Setup

NALA := /usr/bin/nala
GIT := /usr/bin/git
DOCKER := /usr/bin/docker
DOCKER_COMPOSE := docker-compose

nala-upgrade: $(NALA)
	sudo nala update
	sudo nala upgrade

$(NALA):
	sudo apt update
	sudo apt upgrade
	sudo apt install nala

$(GIT): nala-upgrade
	sudo nala install git

$(DOCKER): nala-upgrade
	sudo nala install docker

$(DOCKER_COMPOSE): $(DOCKER)
	sudo nala install ca-certificates curl
	sudo install -m 0755 -d /etc/apt/keyrings
	sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
	sudo chmod a+r /etc/apt/keyrings/docker.asc
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
				$(. /etc/os-release && echo "\$VERSION_CODENAME") stable" | \
				sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
	sudo nala update
	sudo nala install docker-compose-plugin

install-ubuntu-tools: $(GIT) $(DOCKER_COMPOSE)
	@echo "Все необходимые инструменты установлены"

help:
	@echo "Пожалуйста, прочтите Readme.md файл, раздел 'Настройка окружения'"
